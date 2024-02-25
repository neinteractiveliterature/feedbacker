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

module.exports = {
    humanize: humanize,
    teamMembers: teamMembers
};
