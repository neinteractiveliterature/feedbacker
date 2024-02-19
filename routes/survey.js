const express = require('express');
const csrf = require('csurf');
const async = require('async');
const _ = require('underscore');
const surveyHelper = require('../lib/survey-helper');
const permission = require('../lib/permission');
const shortid = require('shortid');


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
            survey.response = await req.models.response.find({survey_id: survey.id, user_id: req.user.id});
            return survey;
        });
        res.render('surveys/index', { pageTitle: 'Surveys' });
    } catch (err){
        next(err);
    }
}

async function show(req, res, next){
    const surveyId = req.params.id;

    try {
        res.locals.survey = await surveyHelper.getSurvey(surveyId);
        const responseRow = await req.models.response.findOne({survey_id: surveyId, user_id: req.user.id});

        let response = null;
        if (responseRow){
            response = await surveyHelper.getResponse(responseRow.id);
        } else {
            const responseData = {
                survey_id: surveyId,
                user_id: req.user.id,
                anonymous: false,
                complete: false,
                tag: shortid.generate()
            };
            const responseId = req.models.response.create(responseData);
            response = await surveyHelper.getResponse(responseId);
        }
        res.locals.response = response;

        const events = (await req.intercode.getEvents()).filter(event => {
            if (event.event_category.name === 'Volunteer event') { return false; }
            if (event.event_category.name === 'Con services') { return false; }
            return true;
        })
        res.locals.events = _.indexBy(events, 'id');

        let signups = await req.intercode.getSignups(req.user.intercode_id);
        let userEvents = signups
            .filter(signup => {return signup.state !== 'withdrawn';})
            .map(signup => { return Number(signup.run.event.id);});

        res.locals.getValue = function(question_id){
            if (_.has(response.responses, question_id)){
                return response.responses[question_id].value;
            } else {
                return null;
            }
        };

        if (response.feedback){
            response.feedback.forEach(function(event){
                if (event.skipped){
                    userEvents = _.without(userEvents, event.event_id);
                } else {
                    userEvents.push(event.event_id);
                }
            });
        }
        console.log(userEvents)
        res.locals.userEvents = userEvents;

        res.render('surveys/show', { pageTitle: res.locals.survey.name });
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
router.use(surveyHelper.setSection('survey'));

router.get('/', permission('login'), list);
router.get('/new', permission('staff'), csrf(), showNew);
router.get('/:id', permission('login'), csrf(), show);
router.get('/:id/edit', permission('staff'), csrf(), showEdit);

router.post('/', permission('staff'), csrf(), create);

router.put('/:id', permission('staff'), csrf(), update);

router.delete('/:id', permission('staff'), remove);

module.exports = router;

