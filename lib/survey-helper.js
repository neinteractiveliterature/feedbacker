'use strict';
var config = require('config');
var _ = require('underscore');
var async = require('async');
var models = require('./models');
var pluralize = require('pluralize');


async function getResponse(id){
    const response = await models.response.get(id);
    response.feedback = await models.feedback.find({response_id: response.id});
    response.responses = await models.question_response.find({response_id: response.id});
    return response;
}

async function getSurvey(id){
    const survey = await models.survey.get(id);
    survey.questions = await models.question.find({survey_id: id});
    return survey;
}

function saveResponse(data){

}

function humanize(str){
    str = str.replace(/_/, ' ');
    var lower = String(str).toLowerCase();
    return lower.replace(/(^| )(\w)/g, function(x) {
        return x.toUpperCase();
    });
}

function teamMembers(event){
    var str = humanize(event.team_member_name);
    var team_members = getTeamMembers(event.team_members);
    if (team_members.length !== 1){
        str = pluralize(str);
    }
    str += ': ';

    str += _.pluck(team_members, 'name_without_nickname').join(', ');
    return str;
}

function getTeamMembers(members){
    var team_members = _.where(members, {display:true});
    return _.pluck(team_members, 'user_con_profile');
}

function setSection(section){
    return function(req, res, next){
        res.locals.siteSection = section;
        next();
    };
}

module.exports = {
    getResponse: getResponse,
    getSurvey:getSurvey,
    saveResponse: saveResponse,
    humanize: humanize,
    setSection: setSection,
    teamMembers: teamMembers
};
