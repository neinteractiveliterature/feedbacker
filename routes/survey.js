const express = require('express');
const csrf = require('csurf');
const async = require('async');
const _ = require('underscore');
const moment = require('moment');
const surveyHelper = require('../lib/survey-helper');
const permission = require('../lib/permission');
const stringify = require('csv-stringify-as-promised');

async function list(req, res, next){
    res.locals.breadcrumbs = {
        path: [
            { url: '/', name: 'Home'},
        ],
        current: 'Surveys'
    };
    try {
        const surveys = await req.models.survey.find({deleted:false});
        res.locals.surveys = await async.map(surveys, async function(survey, cb){
            survey.convention = await req.intercode.getConvention(survey.base_url);
            survey.response = await req.models.response.findOne({survey_id: survey.id, user_id: req.user.id});
            survey.responses = await surveyHelper.getResponses(survey, req.user, req.intercode, true);
            survey.feedback = await surveyHelper.getFeedback(survey, req.user, req.intercode);
            try{
                survey.userEvents = await req.intercode.getMemberEvents(req.user.intercode_id, survey.base_url);
            } catch(err){
                survey.userEvents = [];
                survey.noProfile = true;
            }

            return survey;
        });
        res.locals.title += ' - Survey List';
        res.render('survey/list', { pageTitle: 'Surveys' });
    } catch (err){
        next(err);
    }
}

async function show(req, res, next){

}

async function showFeedback(req, res, next){
    const surveyId = req.params.id;
    try{
        const survey = await req.models.survey.get(surveyId);
        try {
            surveyValidator(survey, res, 'published');
        } catch (err){
            req.flash('error', err.message);
            return res.redirect('/survey');
        }

        res.locals.feedback = await surveyHelper.getFeedback(survey, req.user, req.intercode);
        res.locals.survey = survey;
        res.locals.breadcrumbs = {
            path: [
                { url: '/', name: 'Home'},
                { url: '/survey', name: 'Surveys'},
            ],
            current: `Event feedback from ${survey.name}`
        };
        res.locals.title += ` - Feedback - ${survey.name}`;
        res.render('survey/feedback');

    } catch(err){
        next(err);
    }
}

async function showFeedbackCsv(req, res, next){
    const surveyId = req.params.id;
    try{
        const survey = await req.models.survey.get(surveyId);
        try {
            surveyValidator(survey, res, 'published');
        } catch (err){
            req.flash('error', err.message);
            return res.redirect('/survey');
        }
        const feedback = await surveyHelper.getFeedback(survey, req.user, req.intercode);

        const doc = [];
        const header = [
            'Event',
            'Category',
            'Name',
            'Feedback'
        ];
        doc.push(header);
        for (const eventId in feedback){
            const event = feedback[eventId];
            for (const item of event.feedback){
                const row = [];
                row.push(event.event.title);
                row.push(event.event.event_category.name);
                if (item.user){
                    row.push(item.user);
                } else {
                    row.push('Anonymous');
                }
                row.push(item.content);
                doc.push(row);
            }
        }
        const output = await stringify(doc);
        res.attachment(`${survey.name} - My Feedback.csv`);
        res.end(output);

    } catch(err){
        next(err);
    }
}

async function showResponses(req, res, next){
    const surveyId = req.params.id;
    try{
        const survey = await req.models.survey.get(surveyId);
        try {
            surveyValidator(survey, res, 'any');
        } catch (err){
            req.flash('error', err.message);
            return res.redirect('/survey');
        }
        res.locals.responses = await surveyHelper.getResponses(survey, req.user, req.intercode);
        res.locals.survey = survey;
        const events = (await req.intercode.getEvents(survey.base_url)).filter(event => {
            if (event.event_category.name === 'Volunteer event') { return false; }
            if (event.event_category.name === 'Con services') { return false; }
            return true;
        });
        res.locals.events = _.indexBy(events, 'id');

        res.locals.breadcrumbs = {
            path: [
                { url: '/', name: 'Home'},
                { url: '/survey', name: 'Surveys'},
            ],
            current: `Responses from ${survey.name}`
        };
        res.locals.title += ` - Responses - ${survey.name}`;
        res.render('survey/responses');

    } catch(err){
        next(err);
    }
}

async function showResponsesCsv(req, res, next){
    const surveyId = req.params.id;
    try{
        const survey = await req.models.survey.get(surveyId);
        try {
            surveyValidator(survey, res, 'any');
        } catch (err){
            req.flash('error', err.message);
            return res.redirect('/survey');
        }

        const responses = await surveyHelper.getResponses(survey, req.user, req.intercode);

        const doc = [];
        const header = [];
        const questions = [];
        header.push('Name');
        header.push('Email');
        header.push('Timestamp');
        for (const question of survey.questions){
            if (question.type !== 'events'){
                header.push(question.name);
                questions.push(question.id);
            }
        }
        doc.push(header);
        for (const response of responses){
            const row = [];

            if (response.user){
                row.push(response.user.name);
                row.push(response.user.email);
            } else {
                row.push('Anonymous');
                row.push('');
            }
            row.push(moment(response.updated).format());
            for (const questionId of questions){
                const questionResponse = _.findWhere(response.responses, {question_id:questionId});
                if (questionResponse){
                    row.push(questionResponse.value);
                } else {
                    row.push('');
                }
            }
            doc.push(row);
        }

        const output = await stringify(doc);
        res.attachment(`${survey.name} - Responses.csv`);
        res.end(output);

    } catch(err){
        next(err);
    }
}


async function showResponseFeedbackCsv(req, res, next){
    const surveyId = req.params.id;
    try{
        const survey = await req.models.survey.get(surveyId);
        try {
            surveyValidator(survey, res, 'any');
        } catch (err){
            req.flash('error', err.message);
            return res.redirect('/survey');
        }
        const responses = await surveyHelper.getResponses(survey, req.user, req.intercode);

        let events = _.indexBy(await req.intercode.getEvents(survey.base_url), 'id');

        const doc = [];
        const header = [
            'Name',
            'Email',
            'Timestamp',
            'Event',
            'Category',
            'Recommend',
            'Concom Feedback',
            'GM Feedback',
            'Anonymous'
        ];
        doc.push(header);
        for (const response of responses){
            for (const feedback of response.feedback){
                if (feedback.skipped) { continue; }
                const row = [];

                if (response.user){
                    row.push(response.user.name);
                    row.push(response.user.email);
                } else {
                    row.push('Anonymous');
                    row.push('');
                }
                row.push(moment(response.updated).format());
                const event = events[feedback.event_id];
                if (event) {
                    row.push(event.title);
                    row.push(event.event_category.name);
                } else {
                    row.push('Unknown');
                    row.push('Unknown');
                }
                row.push(feedback.recommend);
                row.push(feedback.concom);
                row.push(feedback.gm);
                row.push(feedback.gm_use_name?'No':'Yes');
                doc.push(row);
            }

        }

        const output = await stringify(doc);
        res.attachment(`${survey.name} - Event Feedback.csv`);
        res.end(output);

    } catch(err){
        next(err);
    }
}


async function showNew(req, res, next){
    res.locals.survey = {
        name: null,
        questions: [],
        base_url: null,
        published: false,
        css: '',
        body_font: null,
        header_font: null,
        brand_font: null
    };

    if (req.query.clone){
        const survey = await req.models.survey.get(req.query.clone);
        if(!survey){
            throw new Error('Invalid Survey');
        }
        delete survey.id;
        survey.clone_id = Number(req.query.clone);
        survey.published = false;
        res.locals.survey = survey;
        res.locals.breadcrumbs = {
            path: [
                { url: '/', name: 'Home'},
                { url: '/survey', name: 'Surveys'},
            ],
            current: `Clone: ${survey.name}`
        };
        res.locals.title += ` - Clone Survey - ${survey.name}`;
    } else {
        res.locals.survey = {
            name: null,
            questions: [],
            base_url: null,
            published: false,
            css: '',
            body_font: null,
            header_font: null,
            brand_font: null
        };

        res.locals.breadcrumbs = {
            path: [
                { url: '/', name: 'Home'},
                { url: '/survey', name: 'Surveys'},
            ],
            current: 'New'
        };
    }

    res.locals.csrfToken = req.csrfToken();
    if (_.has(req.session, 'surveyData')){
        res.locals.survey = req.session.surveyData;
        delete req.session.surveyData;
    }
    try{
        res.locals.conventions = _.sortBy(await req.intercode.getConventions(), 'name');
        res.locals.title += ' - New Survey}';
        res.render('survey/new');
    } catch (err){
        next(err);
    }
}

async function showEdit(req, res, next){
    const id = req.params.id;
    res.locals.csrfToken = req.csrfToken();

    try{
        const survey = await req.models.survey.get(id);
        try {
            surveyValidator(survey, res, 'staff');
        } catch (err){
            req.flash('error', err.message);
            return res.redirect('/survey');
        }

        res.locals.breadcrumbs = {
            path: [
                { url: '/', name: 'Home'},
                { url: '/survey', name: 'Surveys'},
            ],
            current: 'Edit: ' + survey.name
        };
        res.locals.survey = survey;
        if (_.has(req.session, 'surveyData')){
            res.locals.survey = req.session.surveyData;
            delete req.session.surveyData;
        }
        res.locals.title += ` - Edit ${survey.name}`;
        res.locals.conventions =  _.sortBy(await req.intercode.getConventions(), 'name');
        res.render('survey/edit');

    } catch(err){
        next(err);
    }
}

async function create(req, res, next){
    const survey = req.body.survey;

    req.session.surveyData = survey;

    if (!_.has(survey, 'published')){
        survey.published = false;
    }

    survey.updated = new Date();
    survey.created_by = req.user.id;

    try {
        if (!res.locals.checkPermission('staff', survey.base_url)){
            req.flash('error', `Not staff on ${survey.base_url}`);
            return res.redirect('/survey');
        }

        const id = await req.models.survey.create(survey);
        if (survey.clone_id){
            const questions = await req.models.question.find({survey_id:survey.clone_id});
            for (const question of questions){
                question.survey_id = id;
                await req.models.question.create(question);
            }
        }
        req.flash('success', `Created Survey: ${survey.name}`);
        delete req.session.surveyData;
        res.redirect('/survey');
    } catch(err){
        req.flash('error', err.toString());
        return res.redirect('/survey/new');
    }
}

async function update(req, res, next){
    const id = req.params.id;
    const survey = req.body.survey;

    req.session.surveyData = survey;

    if (!_.has(survey, 'published')){
        survey.published = false;
    }
    survey.updated = new Date();

    try{
        const current = await req.models.survey.get(id);
        try {
            surveyValidator(current, res, 'staff');
        } catch (err){
            req.flash('error', err.message);
            return res.redirect('/survey');
        }


        for (const field of ['created', 'created_by']){
            survey[field] = current[field];
        }

        await req.models.survey.update(id, survey);
        delete req.session.surveyData;
        req.flash('success', `Updated Survey: ${survey.name}`);
        res.redirect('/survey');
    } catch(err){
        next(err);
    }
}

async function remove(req, res, next){
    const id = req.params.id;
    try{
        const current = await req.models.survey.get(id);
        try {
            surveyValidator(current, res, 'staff');
        } catch (err){
            req.flash('error', err.message);
            return res.redirect('/survey');
        }

        current.deleted = true;
        await req.models.survey.update(id, current);
        req.flash('success', `Removed Survey: ${current.name}`);
        res.redirect('/survey');
    } catch(err){
        next(err);
    }
}

function surveyValidator(survey, res, permission){
    if (!survey){
        throw new Error('Survey not found');
    }
    if (survey.deleted){
        throw new Error('Survey has been deleted');
    }
    if (permission === 'published'){
        if (!(survey.published || res.locals.checkPermission('any', survey.base_url))){
            throw new Error('Survey not published');
        }

    } else if (permission === 'any'){

        if (!res.locals.checkPermission('any', survey.base_url)){
            throw new Error('Not Authorized');
        }
    } else if (permission === 'staff'){
        if (!res.locals.checkPermission('staff', survey.base_url)){
            throw new Error(`Not staff on ${survey.base_url}`);
        }
    }
    return;
}

const router = express.Router();

router.use(function(req, res, next){
    res.locals.siteSection='survey';
    next();
});
router.use(permission('login'));

router.get('/', list);
router.get('/new', permission('staff'), csrf(), showNew);
router.get('/:id', permission('staff'), csrf(), show);
router.get('/:id/feedback',  csrf(), showFeedback);
router.get('/:id/feedback/export', csrf(), showFeedbackCsv);
router.get('/:id/responses', csrf(), showResponses);
router.get('/:id/responses/export', csrf(), showResponsesCsv);
router.get('/:id/responses/exportFeedback', csrf(), showResponseFeedbackCsv);
router.get('/:id/edit', permission('staff'), csrf(), showEdit);
router.post('/', permission('staff'), csrf(), create);
router.put('/:id', permission('staff'), csrf(), update);

router.delete('/:id', permission('staff'), remove);

module.exports = router;

