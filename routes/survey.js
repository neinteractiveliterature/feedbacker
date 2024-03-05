const express = require('express');
const csrf = require('csurf');
const async = require('async');
const _ = require('underscore');
const surveyHelper = require('../lib/survey-helper');
const permission = require('../lib/permission');

async function list(req, res, next){
    res.locals.breadcrumbs = {
        path: [
            { url: '/', name: 'Home'},
        ],
        current: 'Surveys'
    };
    try {
        const surveys = await req.models.survey.find({});
        res.locals.surveys = await async.map(surveys, async function(survey, cb){
            survey.convention = await req.intercode.getConvention();
            survey.response = await req.models.response.findOne({survey_id: survey.id, user_id: req.user.id});
            survey.responses = await surveyHelper.getResponses(survey, req.user, req.intercode);
            survey.feedback = await surveyHelper.getFeedback(survey, req.user, req.intercode);
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
        if (!survey){
            req.flash('error', 'Survey not found');
            return res.redirect('/survey');
        }
        if (!survey.published){
            req.flash('error', 'Survey not published');
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
        res.render('survey/feedback', {pageTitle: `Event feedback from ${survey.name}`});

    } catch(err){
        next(err);
    }
}

async function showResponses(req, res, next){
    const surveyId = req.params.id;
    try{
        const survey = await req.models.survey.get(surveyId);
        if (!survey){
            req.flash('error', 'Survey not found');
            return res.redirect('/survey');
        }
        if (!survey.published){
            req.flash('error', 'Survey not published');
            return res.redirect('/survey');
        }
        res.locals.responses = await surveyHelper.getResponses(survey, req.user, req.intercode);
        res.locals.survey = survey;
        const events = (await req.intercode.getEvents()).filter(event => {
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
        res.render('survey/responses', {pageTitle: `Responses from ${survey.name}`});

    } catch(err){
        next(err);
    }
}


function showNew(req, res, next){
    res.locals.survey = {
        name: null,
        questions: [],
        base_url: null,
        published: false
    };
    res.locals.breadcrumbs = {
        path: [
            { url: '/', name: 'Home'},
            { url: '/survey', name: 'Surveys'},
        ],
        current: 'New'
    };

    res.locals.csrfToken = req.csrfToken();
    if (_.has(req.session, 'surveyData')){
        res.locals.survey = req.session.surveyData;
        delete req.session.surveyData;
    }
    res.locals.title += ' - New Survey}';
    res.render('survey/new');
}

async function showEdit(req, res, next){
    const id = req.params.id;
    res.locals.csrfToken = req.csrfToken();

    try{
        const survey = await req.models.survey.get(id);
        if (!survey){
            req.flash('error', 'Invalid Survey');
            return req.redirect('/survey');
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
        await req.models.survey.create(survey);
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
        if (!current){
            req.flash('error', 'Invalid Survey');
            return req.redirect('/survey');
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
        if (!current){
            req.flash('error', 'Invalid Survey');
            return req.redirect('/survey');
        }
        await req.models.survey.delete(id);
        req.flash('success', `Removed Survey: ${current.name}`);
        res.redirect('/survey');
    } catch(err){
        next(err);
    }
}

const router = express.Router();

router.use(function(req, res, next){
    res.locals.siteSection='survey';
    next();
});

router.get('/', permission('login'), list);
router.get('/new', permission('staff'), csrf(), showNew);
router.get('/:id', permission('staff'), csrf(), show);
router.get('/:id/feedback', permission('login'), csrf(), showFeedback);
router.get('/:id/responses', permission('Con Com'), csrf(), showResponses);

router.get('/:id/edit', permission('staff'), csrf(), showEdit);
router.post('/', permission('staff'), csrf(), create);
router.put('/:id', permission('staff'), csrf(), update);

router.delete('/:id', permission('staff'), remove);

module.exports = router;

