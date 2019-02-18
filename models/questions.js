'use strict';
var async = require('async');
var _ = require('underscore');
var database = require('../lib/database');
var validator = require('validator');

exports.get = function(id, cb){
    var query = 'select * from questions where id = $1';
    database.query(query, [id], function(err, result){
        if (err) { return cb(err); }
        if (result.rows.length){
            return cb(null, result.rows[0]);
        }
        return cb();
    });
};

exports.list = function(survey_id, cb){
    var query = 'select * from questions where survey_id = $1 order by display_order';
    database.query(query, [survey_id], function(err, result){
        if (err) { return cb(err); }
        return cb(null, result.rows);
    });
};

exports.create = function(data, cb){
    if (! validate(data)){
        return process.nextTick(function(){
            cb('Invalid Data');
        });
    }
    getNextDisplayOrder(data.survey_id, function(err, displayOrder){
        if (err) { return cb(err); }
        var query = 'insert into questions (survey_id, question, description, type, display_order, required) values ($1, $2, $3, $4, $5, $6) returning id';
        var dataArr = [data.survey_id, data.question, data.description, data.type, displayOrder, data.required];
        database.query(query, dataArr, function(err, result){
            if (err) { return cb(err); }
            return cb(null, result.rows[0].id);
        });
    });
};

exports.update =  function(id, data, cb){
    if (! validate(data)){
        return process.nextTick(function(){
            cb('Invalid Data');
        });
    }
    var query = 'update questions set question = $2, description = $3, type = $4, display_order = $5, required = $6 where id = $1';
    var dataArr = [id, data.question, data.description, data.type, data.display_order, data.required];

    database.query(query, dataArr, cb);
};

exports.delete =  function(id, cb){
    var query = 'delete from questions where id = $1';
    database.query(query, [id], cb);
};

function getNextDisplayOrder(survey_id, cb){
    var query = 'select max(display_order) as max_order from surveys where survey_id = $1';
    database.query(query, [survey_id], function(err, result){
        if (err) { return cb(err); }
        if (result.rows.length){
            cb(null, result.rows[0].max_order+1);
        } else {
            cb(null, 0);
        }
    });
}

function validate(data){
    if (! validator.isLength(data.question, 2, 255)){
        return false;
    }
    return true;
}
