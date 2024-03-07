const express = require('express');
const csrf = require('csurf');
const _ = require('underscore');
const permission = require('../lib/permission');
const validator = require('validator');


async function showNew(req, res, next){
    const surveyId = req.params.surveyId;
    try{
        const survey = await req.models.survey.get(surveyId);
        if (!survey){
            req.flash('error', 'Invalid Survey');
            return req.redirect('/');
        }
        res.locals.question = {
            survey_id: surveyId,
            question: null,
            description: null,
            type: null,
            config: {},
            required: false
        };
        res.locals.breadcrumbs = {
            path: [
                { url: '/', name: 'Home'},
                { url: '/survey', name: 'Surveys'},
                { url: `/survey/${surveyId}`, name: survey.name},
            ],
            current: 'New Question'
        };

        res.locals.csrfToken = req.csrfToken();

        if (_.has(req.session, 'questionData')){
            res.locals.question = req.session.questionData;
            delete req.session.questionData;
        }
        res.locals.title += ' - New Question';
        res.render('question/new');
    } catch (err){
        next(err);
    }
}

async function showEdit(req, res, next){
    const id = req.params.id;
    res.locals.csrfToken = req.csrfToken();

    try{
        const question = await req.models.question.get(id);
        if (!question){
            req.flash('error', 'Invalid Question');
            return req.redirect('/');
        }
        res.locals.question = question;
        const survey = await req.models.survey.get(question.survey_id);
        if (_.has(req.session, 'questionData')){
            res.locals.question = req.session.questionData;
            delete req.session.questionData;
        }
        res.locals.breadcrumbs = {
            path: [
                { url: '/', name: 'Home'},
                { url: '/survey', name: 'Surveys'},
                { url: `/survey/${survey.id}`, name: survey.name},
            ],
            current: 'Edit Question'
        };
        res.locals.title += ' - Edit Question';
        res.render('question/edit');
    } catch(err){
        next(err);
    }
}

async function create(req, res, next){
    const question = req.body.question;

    req.session.questionData = question;
    for (const field of ['required', 'team_member_only']){
        if (!_.has(question, field)){
            question[field] = false;
        }
    }
    try{
        question.config = JSON.parse(question.config);
        const questions = await req.models.question.find({survey_id:question.survey_id});
        const maxVal = _.max(_.pluck(questions, 'display_order'));
        question.display_order = _.isFinite(maxVal)?maxVal + 1:1;

        const id = await req.models.question.create(question);

        delete req.session.questionData;
        req.flash('success', 'Created question ' + question.question);
        return res.redirect(`/survey/${question.survey_id}/edit`);
    } catch (err) {
        req.flash('error', err.toString());
        return res.redirect('/question/new');
    }
}

async function update(req, res, next){
    const id = req.params.id;
    const question = req.body.question;
    req.session.questionData = question;
    for (const field of ['required', 'team_member_only']){
        if (!_.has(question, field)){
            question[field] = false;
        }
    }

    try {
        const current = await req.models.question.get(id);
        question.config = JSON.parse(question.config);
        await req.models.question.update(id, question);
        delete req.session.questionData;
        req.flash('success', 'Updated question ' + question.question);
        return res.redirect(`/survey/${current.survey_id}/edit`);

    } catch(err) {
        req.flash('error', err.toString());
        return res.redirect(`/question/${id}/edit`);

    }
}

async function remove(req, res, next){
    const id = req.params.id;
    try {
        const current = await req.models.question.get(id);
        await req.models.question.delete(id);
        req.flash('success', 'Removed Question');
        res.redirect(`/survey/${current.survey_id}`);
    } catch(err) {
        return next(err);
    }
}

async function reorder(req, res, next){
    try {
        for (const update of req.body){
            const question = await req.models.question.get(update.id);
            if (!question){
                throw new Error ('Invalid record');
            }
            question.display_order = update.display_order;
            await req.models.question.update(update.id, question);
        }
        res.json({success:true});
    }catch (err) {
        return next(err);
    }
}

const router = express.Router();

router.use(permission('staff'));
router.use(function(req, res, next){
    res.locals.siteSection='survey';
    next();
});

router.get('/new/:surveyId', csrf(), showNew);
router.get('/:id', csrf(), showEdit);
router.get('/:id/edit', csrf(),showEdit);
router.post('/', csrf(), create);
router.put('/order', csrf(), reorder);
router.put('/:id', csrf(), update);
router.delete('/:id', permission('admin'), remove);

module.exports = router;
