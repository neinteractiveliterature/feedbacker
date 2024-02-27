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
        res.render('survey/index', { pageTitle: 'Surveys' });
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

        res.render('survey/responses', {pageTitle: `Responses from ${survey.name}`});

    } catch(err){
        next(err);
    }
}


function showNew(req, res, next){
    res.locals.survey = {
        name: null,
        questions: [],
    };
    res.locals.breadcrumbs = {
        path: [
            { url: '/', name: 'Home'},
            { url: '/surveys', name: 'Surveys'},
        ],
        current: 'New'
    };

    res.locals.csrfToken = req.csrfToken();
    if (_.has(req.session, 'surveyData')){
        res.locals.survey = req.session.surveyData;
        delete req.session.surveyData;
    }
    res.render('surveys/new');
}
function showEdit(req, res, next){
    const id = req.params.id;
    res.locals.csrfToken = req.csrfToken();


    req.models.surveys.get(id, function(err, survey){
        if (err) { return next(err); }
        res.locals.survey = survey;
        if (_.has(req.session, 'surveyData')){
            res.locals.survey = req.session.surveyData;
            delete req.session.surveyData;
        }
        res.locals.breadcrumbs = {
            path: [
                { url: '/', name: 'Home'},
                { url: '/surveys', name: 'Surveys'},
            ],
            current: 'Edit: ' + survey.name
        };

        res.render('surveys/edit');
    });
}

function create(req, res, next){
    const survey = req.body.survey;

    req.session.surveyData = survey;

    surveyHelper.createSurvey(survey, function(err, id){
        if (err) {
            req.flash('error', err.toString());
            return res.redirect('/survey/new');
        }
        delete req.session.surveyData;
        req.flash('success', 'Created Survey ' + survey.name);
        res.redirect('/survey');
    });
}

function update(req, res, next){
    const id = req.params.id;
    const survey = req.body.survey;
    req.session.surveyData = survey;

    req.models.surveys.get(id, function(err, current){
        if (err) { return next(err); }

        surveyHelper.updateSurvey(id, survey, function(err){
            if (err){
                req.flash('error', err.toString());
                return (res.redirect('/surveys/'+id));
            }
            delete req.session.furnitureData;
            req.flash('success', 'Updated Surveys ' + survey.name);
            res.redirect('/surveys');
        });
    });
}

function remove(req, res, next){
    const id = req.params.id;
    req.models.surveys.delete(id, function(err){
        if (err) { return next(err); }
        req.flash('success', 'Removed Survey');
        res.redirect('/surveys');
    });
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

