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

async function getResponses(survey, user, intercode, skipRelations){
    let permissions = null;
    try {
        permissions = await intercode.getPermissions(user.intercode_id, survey.base_url);
    } catch (e){
        return [];
    }
    if (!(permissions.privileges.indexOf('site_admin') !== -1 || permissions.positions.length)){
        return [];
    }
    const options = {};
    if (skipRelations){
        options.postSelect = async function noop(val){return val;};
    }
    return models.response.find({survey_id: survey.id, complete:true}, options);
}

async function getFeedback(survey, user, intercode){
    let memberEvents = null;
    try{
        memberEvents = await intercode.getMemberEvents(user.intercode_id, survey.base_url);
    } catch (e){
        return {};
    }

    if (!memberEvents.length){
        return {};
    }

    const output = {};

    for (const event of memberEvents){
        const eventId = Number(event.id);
        const feedbacks = await models.feedback.find({event_id: eventId, skipped:false});
        for(const feedback of feedbacks){
            if (!(feedback.gm && feedback.gm !== '')){
                continue;
            }
            const response = await models.response.get(feedback.response_id);
            if (response.survey_id !== survey.id){
                continue;
            }

            if (!_.has(output, eventId)){
                output[eventId] = {
                    event: event,
                    feedback: []
                };
            }

            const doc = {
                content: feedback.gm
            };
            if (feedback.gm_use_name){
                if (response.user){
                    doc.user = response.user.name;
                } else {
                    doc.user = (await models.user.get(response.user_id)).name;
                }
            }
            output[eventId].feedback.push(doc);

        }

    }
    return output;
}



module.exports = {
    humanize: humanize,
    teamMembers: teamMembers,
    getResponses: getResponses,
    getFeedback: getFeedback
};
