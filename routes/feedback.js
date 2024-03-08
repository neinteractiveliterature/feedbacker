const express = require('express');
const csrf = require('csurf');
const async = require('async');
const _ = require('underscore');
const surveyHelper = require('../lib/survey-helper');
const permission = require('../lib/permission');



async function showApi(req, res, next){
    const responseId = req.params.responseId;
    const eventId = req.params.eventId;

    try {
        const event = await req.intercode.getEvent(eventId);
        if (!event){
            return res.status(404).json({success:false, error:'Not a valid event'});
        }
        const response = await req.models.response.get(responseId);
        if (!response){
            return res.status(404).json({success:false, error:'Not a valid survey response'});
        }
        if (! ((response.user_id === req.user.id) || res.locals.checkPermission('staff'))){
            return res.status(403).json({success:false, error: 'not permitted'});
        }
        const survey = await req.models.survey.get(response.survey_id);
        if (!( survey.published || res.locals.checkPermission('staff'))){
            return res.status(403).json({success:false, error: 'Survey is not published'});
        }

        let feedback = await req.models.feedback.findOne({response_id:responseId, event_id:eventId});
        if (!feedback){
            feedback = {
                response_id: responseId,
                event_id: eventId,
                concom: null,
                gm: null,
                recommend: -1,
                gm_use_name: false,
                skipped:false,
                created: new Date()
            };
        }
        res.json({
            feedback:feedback,
            event:event,
            csrfToken: req.csrfToken()
        });


    } catch(err){
        res.status(500).json({success:false, error:err});
    }
}

async function createApi(req, res, next){
    const feedback = req.body.feedback;

    req.session.feedbackData = feedback;

    try{
        const response = await req.models.response.get(feedback.response_id);
        if (!response){
            return res.status(404).json({success:false, error:'Not a valid survey response'});
        }
        if (! ((response.user_id === req.user.id) || res.locals.checkPermission('staff'))){
            return res.status(403).json({success:false, error: 'not permitted'});
        }
        if (!response.survey_id){
            return res.status(401).json({success:false, error: 'no survey id specified'});
        }
        const survey = await req.models.survey.get(response.survey_id);
        if (!( survey.published || res.locals.checkPermission('staff'))){
            return res.status(403).json({success:false, error: 'Survey is not published'});
        }
        feedback.recommend = Number(feedback.recommend);
        await req.models.feedback.create(feedback);
        delete req.session.feedbackData;
        res.json({success:true});
    } catch(err){
        res.status(500).json({success:false, error:err});
    }
}

async function updateApi(req, res, next){
    const feedbackId = req.params.id;
    const feedback = req.body.feedback;

    req.session.feedbackData = feedback;

    try{
        const current = await req.models.feedback.get(feedbackId);
        if (!current){
            return res.status(404).json({success:false, error:'Not a valid event response'});
        }
        const response = await req.models.response.get(current.response_id);
        if (! ((response.user_id === req.user.id) || res.locals.checkPermission('staff'))){
            return res.status(403).json({success:false, error: 'not permitted'});
        }
        const survey = await req.models.survey.get(response.survey_id);
        if (!( survey.published || res.locals.checkPermission('staff'))){
            return res.status(403).json({success:false, error: 'Survey is not published'});
        }
        feedback.recommend = Number(feedback.recommend);

        feedback.response_id = current.response_id;
        await req.models.feedback.update(feedbackId, feedback);

        res.json({success:true});
    } catch(err){
        res.status(500).json({success:false, error:err});
    }
}

async function removeApi(req, res, next){
    const id = req.params.id;
    try {
        await req.models.feedback.delete(id);
        res.json({success:true});
    } catch(err){
        res.status(500).json({success:false, error:err});
    }

}

async function removeSignupApi(req, res, next){
    const responseId = req.params.responseId;
    const eventId = req.params.eventId;
    try {

        const event = await req.intercode.getEvent(eventId);
        if (!event){
            return res.status(404).json({success:false, error:'Not a valid event'});
        }
        const response = await req.models.response.get(responseId);
        if (!response){
            return res.status(404).json({success:false, error:'Not a valid survey response'});
        }
        if (! ((response.user_id === req.user.id) || res.locals.checkPermission('staff'))){
            return res.status(403).json({success:false, error: 'not permitted'});
        }
        const survey = await req.models.survey.get(response.survey_id);
        if (!( survey.published || res.locals.checkPermission('staff'))){
            return res.status(403).json({success:false, error: 'Survey is not published'});
        }

        let feedback = await req.models.feedback.findOne({response_id: responseId, event_id: eventId});
        if (feedback){
            feedback.skipped = true;
            await req.models.feedback.update(feedback.id, feedback);
        } else {
            await req.models.feedback.create({
                response_id: responseId,
                event_id: eventId,
                skipped: true
            });
        }
        res.json({success:true});

    } catch(err){
        next(err);
    }
}

async function addSignupApi(req, res, next){
    const responseId = req.params.responseId;
    const eventId = req.params.eventId;
    try {

        const event = await req.intercode.getEvent(eventId);
        if (!event){
            return res.status(404).json({success:false, error:'Not a valid event'});
        }
        const response = await req.models.response.get(responseId);
        if (!response){
            return res.status(404).json({success:false, error:'Not a valid survey response'});
        }
        if (! ((response.user_id === req.user.id) || res.locals.checkPermission('staff'))){
            return res.status(403).json({success:false, error: 'not permitted'});
        }
        const survey = await req.models.survey.get(response.survey_id);
        if (!( survey.published || res.locals.checkPermission('staff'))){
            return res.status(403).json({success:false, error: 'Survey is not published'});
        }

        let feedback = await req.models.feedback.findOne({response_id: responseId, event_id: eventId});
        if (feedback){
            feedback.skipped = false;
            await req.models.feedback.update(feedback.id, feedback);
        } else {
            await req.models.feedback.create({
                response_id: responseId,
                event_id: eventId
            });
        }
        res.json({success:true});

    } catch(err){
        next(err);
    }
}


const router = express.Router();

router.get('/:responseId/:eventId/api', permission('login'), csrf(), showApi);

router.post('/api', permission('login'), csrf(), createApi);

router.put('/:id/api', permission('login'), csrf(), updateApi);

router.delete('/:id/api', permission('login'), removeApi);

router.delete('/:responseId/remove/:eventId', permission('login'), csrf(), removeSignupApi);
router.post('/:responseId/add/:eventId', permission('login'), csrf(), addSignupApi);

module.exports = router;

