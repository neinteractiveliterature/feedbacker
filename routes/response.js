const express = require('express');
const csrf = require('csurf');
const async = require('async');
const _ = require('underscore');
const surveyHelper = require('../lib/survey-helper');
const permission = require('../lib/permission');
const shortid = require('shortid');


async function showSurvey(req, res, next){
    const surveyId = req.params.surveyId;

    try {
        res.locals.survey = await req.models.survey.get(surveyId);
        if (!( res.locals.survey.published || res.locals.checkPermission('Con Com'))){
            req.flash('error', 'Survey is not published');
            return res.redirect('/survey');
        }
        let response = await req.models.response.findOne({survey_id: surveyId, user_id: req.user.id});



        if (!response){
            const responseData = {
                survey_id: surveyId,
                user_id: req.user.id,
                anonymous: false,
                complete: false,
                tag: shortid.generate()
            };
            const responseId = await req.models.response.create(responseData);
            response = await req.models.response.get(responseId);
        }

        res.locals.breadcrumbs = {
            path: [
                { url: '/', name: 'Home'},
                { url: '/survey', name: 'Surveys'},
            ],
            current: res.locals.survey.name
        };
        if (req.session.responseData){
            response = req.session.responseData;
            response.feedback = await req.models.feedback.find({response_id: response.id});
            delete req.session.responseData;
        }

        res.locals.response = response;

        res.locals.csrfToken = req.csrfToken();
        res.locals.getValue = function(questionId){
            let question_response = _.findWhere(response.responses, {question_id: Number(questionId)});
            if (question_response){
                return question_response.value;
            } else {
                question_response = response.responses[`q-${questionId}`];
                if (question_response) {
                    return question_response;
                } else {
                    return null;
                }
            }
        };
        res.locals.title += ` - ${res.locals.survey.name}`;
        res.render('survey/show', { pageTitle: res.locals.survey.name });
    } catch(err){
        next(err);
    }
}

async function getSignupsApi(req, res, next){
    const responseId = req.params.id;
    try {
        const response = await  req.models.response.get(responseId);
        if (!response){
            return res.status(404).json({success:false, error:'Could not find survey response'});
        }

        const survey = await req.models.survey.get(response.survey_id);
        if (!survey){
            return res.status(404).json({success:false, error:'Not a valid survey'});
        }
        if (!( survey.published || res.locals.checkPermission('Con Com'))){
            return res.status(403).json({success:false, error:'Survey not published'});
        }

        let signups = await req.intercode.getSignups(req.user.intercode_id);
        let userEvents = signups
            .filter(signup => {
                if (signup.run.event.event_category.name === 'Volunteer event') { return false; }
                if (signup.run.event.event_category.name === 'Con services') { return false; }
                if (req.user.id === response.user_id){
                    for (const team_member of signup.run.event.team_members){
                        if (team_member.display_team_member && Number(team_member.user_con_profile.user_id) === req.user.intercode_id){
                            return false;
                        }
                    }
                }
                return true;
            })
            .filter(signup => {return signup.state !== 'withdrawn';})
            .filter(signup => {return signup.state !== 'waitlisted';})
            .map(signup => { return Number(signup.run.event.id);});

        if (response.feedback){
            response.feedback.forEach(function(event){
                if (event.skipped){
                    userEvents = _.without(userEvents, event.event_id);
                } else {
                    userEvents.push(event.event_id);
                }
            });
        }

        userEvents = _.uniq(userEvents);

        userEvents = await async.map(userEvents, async (eventId) => {
            try{
                const event = await req.intercode.getEvent(eventId);
                const feedback = await req.models.feedback.findOne({response_id: response.id, event_id: eventId});

                return {
                    event: event,
                    feedback: feedback
                };
            }  catch (err){
                return {event:{id:eventId, title:'unknown', event_category:{name:'unknown'}}, feedback:{}};
            }
        });
        userEvents = userEvents.sort((a, b) => {
            if (a.event.event_category.name != b.event.event_category.name){
                return a.event.event_category.name.localeCompare(b.event.event_category.name);
            }
            const regex = /[^\w\d]*/g;
            const aTitle = a.event.title.replace(regex, '');
            const bTitle = b.event.title.replace(regex, '');
            return aTitle.localeCompare(bTitle);
        });

        res.json({
            success: true,
            userEvents: userEvents
        });

    } catch(err){
        next(err);
    }
}

async function getEventsListApi(req, res, next){
    const responseId = req.params.id;
    try {
        const response = await  req.models.response.get(responseId);
        if (!response){
            return res.status(404).json({success:false, error:'Could not find survey response'});
        }

        const survey = await req.models.survey.get(response.survey_id);
        if (!survey){
            return res.status(404).json({success:false, error:'Not a valid survey'});
        }
        if (!( survey.published || res.locals.checkPermission('Con Com'))){
            return res.status(403).json({success:false, error:'Survey not published'});
        }

        const events = (await req.intercode.getEvents()).filter(event => {
            if (event.event_category.name === 'Volunteer event') { return false; }
            if (event.event_category.name === 'Con services') { return false; }
            for (const team_member of event.team_members){
                if (team_member.display_team_member && Number(team_member.user_con_profile.user_id) === req.user.intercode_id){
                    return false;
                }
            }
            return true;
        });

        res.json({
            success: true,
            events: events.sort(eventSorter)
        });
    } catch(err){
        next(err);
    }
}

function eventSorter(a, b){
    const aCategory = a.event_category.name;
    const bCategory = b.event_category.name;
    if (aCategory !== bCategory){
        return aCategory.localeCompare(bCategory);
    }
    const regex = /[^\w\d]*/g;
    const aTitle = a.title.replace(regex, '');
    const bTitle = b.title.replace(regex, '');
    return aTitle.localeCompare(bTitle);
}

async function saveResponse(req, res, next){
    const responseId = req.params.id;
    const response = req.body.response;
    req.session.responseData = response;

    try{
        const current = await req.models.response.get(responseId);
        if (!current){
            return res.status(404).json({success:false, error:'Not a valid response'});
        }
        const survey = await req.models.survey.get(current.survey_id);
        if (!survey.published){
            return res.status(403).json({success:false, error: 'Survey is not published'});
        }

        if (! ((current.user_id === req.user.id) || res.locals.checkPermission('staff'))){
            return res.status(403).json({success:false, error: 'not permitted'});
        }
        if (response.action !== 'unsubmit'){
            const questions = await req.models.question.find({survey_id: survey.id});
            for (const question of questions){
                let question_response = await req.models.question_response.findOne({response_id:responseId, question_id:question.id});
                if (!question_response){
                    question_response = {
                        question_id: question.id,
                        response_id: responseId
                    };
                }
                if (_.has(response.responses, `q-${question.id}`)) {
                    question_response.value = response.responses[`q-${question.id}`];
                } else {
                    question_response.value = null;
                }

                if (_.has(question_response, 'id')){
                    await req.models.question_response.update(question_response.id, question_response);
                } else {
                    await req.models.question_response.create(question_response);
                }

            }
        }
        current.updated = new Date();
        if (response.anonymous) {
            current.anonymous = true;
        } else {
            current.anonymous = false;

        }
        if (response.action === 'submit'){
            current.complete = true;
        } else if (response.action === 'unsubmit'){
            current.complete = false;
        }

        await req.models.response.update(responseId, current);
        delete req.session.responseData;
        if (response.action === 'unsubmit'){
            res.redirect(`/response/${Number(response.survey_id)}`);
        } else {
            res.redirect('/survey');
        }


    } catch(err){
        req.flash('error', err.toString());
        res.redirect(`/response/${Number(response.survey_id)}`);

    }
}


const router = express.Router();
router.get('/:surveyId', permission('login'), csrf(), showSurvey);
router.get('/:id/signups', permission('login'), getSignupsApi);
router.get('/:id/events', permission('login'), getEventsListApi);

router.put('/:id', permission('login'), csrf(), saveResponse);

module.exports = router;

