'use strict';
var config = require('config');
var _ = require('underscore');
var async = require('async');
var models = require('./models');
var pluralize = require('pluralize');


function getResponse(id, cb){
    models.responses.get(id, function(err, response){
        if (err) { return cb(err); }
        async.parallel({
            feedback: function(cb){
                models.feedback.listByResponse(response.id, cb);
            },
            responses: function(cb){
                models.question_responses.listByResponse(response.id, cb);
            }
        }, function(err, result){
            if (err) { return cb(err); }
            response.feedback = result.feedback;
            response.responses = result.responses;
            cb(null, response);
        });
    });
}

function getSurvey(id, cb){
    async.parallel({
        survey: function(cb){
            models.surveys.get(id, cb);
        },
        questions: function(cb){
            models.questions.list(id, cb);
        }
    }, function(err, result){
        if (err) { return cb(err); }
        var survey = result.survey;
        survey.questions = result.questions;
        cb(null, survey);
    });
}

function saveResponse(data, cb){

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
