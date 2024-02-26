'use strict';
var config = require('config');
var _ = require('underscore');
var async = require('async');
var models = require('./models');
var pluralize = require('pluralize');


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

async function getResponses(survey, user, intercode){
    const permissions = await intercode.getPermissions(user.intercode_id);
    const responses = await models.response.find({survey_id: survey.id, complete:true});


    if (permissions.privileges.indexOf('site_admin') !== -1) {
        return responses;
    }
    if (data.permissions.positions.indexOf('Con Com') !== -1){
        return responses;
    }
    return [];
}

async function getFeedback(survey, user, intercode){
    const memberEvents = await intercode.getMemberEvents(user.intercode_id);
    const responses = await models.response.find({survey_id: survey.id, complete:true, skipped:false});
    const feedbacks = {};

    if (!memberEvents.length){
        return feedbacks;
    }

    for (const response of responses){
        for(const feedback of response.feedback){
            if (!(feedback.gm && feedback.gm !== '')){
                continue;
            }
            const event = _.findWhere(memberEvents, {id:''+feedback.event_id});
            if (event){
                if (!_.has(feedbacks, event.id)){
                    feedbacks[event.id] = {
                        event: event,
                        feedback: []
                    }
                }
                const doc = {
                    content: feedback.gm
                }
                if (feedback.gm_use_name){
                    doc.user = (await models.user.get(response.user_id)).name;
                }
                feedbacks[event.id].feedback.push(doc);
            }
        }
    }

    return feedbacks;
}



module.exports = {
    humanize: humanize,
    teamMembers: teamMembers,
    getResponses: getResponses,
    getFeedback: getFeedback
};
