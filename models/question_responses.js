'use strict';
var async = require('async');
var _ = require('underscore');
var database = require('../lib/database');
var validator = require('validator');

exports.get = function(id, cb){
    var query = 'select * from question_responses where id = $1';
    database.query(query, [id], function(err, result){
        if (err) { return cb(err); }
        if (result.rows.length){
            return cb(null, result.rows[0]);
        }
        return cb();
    });
};

exports.listByResponse = function(response_id, cb){
    var query = 'select * from question_responses where response_id = $1';
    database.query(query, [response_id], function(err, result){
        if (err) { return cb(err); }
        return cb(null, result.rows);
    });
};

exports.listByQuestion = function(question_id, cb){
    var query = 'select * from question_responses where question_id = $1';
    database.query(query, [question_id], function(err, result){
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
    var query = 'insert into question_responses (response_id, question_id, values) values ($1, $2, $3, $4, $5) returning id';
    var dataArr = [data.response_id, data.event_id, data.concom, data.gm, data.recommend];
    database.query(query, dataArr, function(err, result){
        if (err) { return cb(err); }
        return cb(null, result.rows[0].id);
    });

};

exports.update =  function(id, data, cb){
    if (! validate(data)){
        return process.nextTick(function(){
            cb('Invalid Data');
        });
    }
    var query = 'update question_responses set value = $2 where id = $1';
    var dataArr = [id, data.value];

    database.query(query, dataArr, cb);
};

exports.delete =  function(id, cb){
    var query = 'delete from question_responses where id = $1';
    database.query(query, [id], cb);
};

function validate(data){
    if (! validator.isNumeric('' + data.response_id)){
        return false;
    }
    if (! validator.isNumeric('' + data.question_id)){
        return false;
    }

    return true;
}
