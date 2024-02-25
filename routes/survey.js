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
            survey.response = await req.models.response.findOne({survey_id: survey.id, user_id: req.user.id});
            return survey;
        });
        res.render('survey/index', { pageTitle: 'Surveys' });
    } catch (err){
        next(err);
    }
}

async function show(req, res, next){

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
router.get('/:id', permission('login'), csrf(), show);

router.get('/:id/edit', permission('staff'), csrf(), showEdit);
router.post('/', permission('staff'), csrf(), create);
router.put('/:id', permission('staff'), csrf(), update);

router.delete('/:id', permission('staff'), remove);

module.exports = router;

