const express = require('express');
const csrf = require('csurf');
const async = require('async');
const _ = require('underscore');
const surveyHelper = require('../lib/survey-helper');
const permission = require('../lib/permission');
const shortid = require('shortid');


function list(req, res, next){
    res.locals.breadcrumbs = {
        path: [
            { url: '/', name: 'Home'},
        ],
        current: 'Surveys'
    };
    req.models.surveys.list(function(err, surveys){
        if (err) { return next(err); }
        async.map(surveys, function(survey, cb){
            req.models.responses.find({survey_id: survey.id, user_id: req.user.id}, function(err, response){
                if (err) { return cb(err); }
                survey.response = response;
                cb(null, survey);
            });
        }, function(err, surveys){
            if (err) { return next(err); }
            res.locals.surveys = surveys || [];
            res.render('surveys/index', { pageTitle: 'Surveys' });
        });
    });
}

function show(req, res, next){
    const survey_id = req.params.id;
    async.parallel({
        survey: function(cb){
            surveyHelper.getSurvey(survey_id, cb);
        },
        response: function(cb){
            req.models.responses.find({survey_id: survey_id, user_id: req.user.id}, function(err, response){
                if (err) { return cb(err); }
                if (response) {
                    return surveyHelper.getResponse(response.id, cb);
                }
                response = {
                    survey_id: survey_id,
                    user_id: req.user.id,
                    anonymous: false,
                    complete: false,
                    tag: shortid.generate()
                };
                req.models.responses.create(response, function(err, response_id){
                    if (err) { return cb(err); }
                    surveyHelper.getResponse(response_id, cb);
                });
            });
        },
        userEvents: function(cb){
            req.intercode.getSignups(req.user.intercode_id, function(err, signups){
                if (err) { return cb(err); }
                const events = {};
                signups.forEach(function(signup){
                    if (signup.state != 'withdrawn'){
                        events[signup.run.event.id] = 1;
                    }
                });
                cb(null, events);
            });
        },
        events: function(cb){
            req.intercode.getEvents(cb);
        }
    }, function(err, result){
        if (err) { return next(err); }
        res.locals.survey = result.survey;
        res.locals.response = result.response;
        res.locals.events = _.indexBy(result.events, 'id');

        res.locals.getValue = function(question_id){
            if (_.has(result.response.responses, question_id)){
                return result.response.responses[question_id].value
            } else {
                return null;
            }
        };

        var userEvents = result.userEvents;
        if (result.response.feedback){
            result.response.feedback.forEach(function(event){
                if (event.skipped){
                    delete userEvents[event.event_id];
                } else {
                    userEvents[event.event_id] = 1;
                }
            });
        }
        res.locals.userEvents = _.keys(userEvents);

        res.render('surveys/show', { pageTitle: result.survey.name });
    });
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

