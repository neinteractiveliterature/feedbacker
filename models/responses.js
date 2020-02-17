'use strict';
var async = require('async');
var _ = require('underscore');
var database = require('../lib/database');
var validator = require('validator');

exports.get = function(id, cb){
    var query = 'select * from responses where id = $1';
    database.query(query, [id], function(err, result){
        if (err) { return cb(err); }
        if (result.rows.length){
            return cb(null, result.rows[0]);
        }
        return cb();
    });
};

exports.find = function(params, cb){
    var query = 'select * from responses where ';
    var dataCounter = 1;
    var causes = [];
    var data = [];
    for (var key in params){
        causes.push('"' + key + '" =  $'+ dataCounter);
        data.push(params[key]);
        dataCounter++;
    }
    query += causes.join (' and ');
    database.query(query, data, function(err, result){
        if (err) { return cb(err); }
        if (result.rows.length){
            return cb(null, result.rows[0]);
        }
        return cb();
    });
};

exports.list = function(survey_id, cb){
    var query = 'select * from responses where survey_id = $1';
    database.query(query, [survey_id], function(err, result){
        if (err) { return cb(err); }
        return cb(null, result.rows);
    });
};

exports.listAll = function(survey_id, cb){
    var query = 'select * from responses';
    database.query(query, [survey_id], function(err, result){
        if (err) { return cb(err); }
        return cb(null, result.rows);
    });
};

exports.create = function(data, cb){
    var query = 'insert into responses (survey_id, user_id, anonymous, complete, tag) values ($1, $2, $3, $4, $5) returning id';
    var dataArr = [data.survey_id, data.user_id, data.anonymous, data.complete, data.tag];
    database.query(query, dataArr, function(err, result){
        if (err) { return cb(err); }
        return cb(null, result.rows[0].id);
    });

};

exports.update =  function(id, data, cb){
    var query = 'update responses set updated = $2, anonymous = $3, complete = $4, tag = $5 where id = $1';
    var dataArr = [id, data.updated, data.anonymous, data.complete, data.tag];

    database.query(query, dataArr, cb);
};

exports.delete =  function(id, cb){
    var query = 'delete from responses where id = $1';
    database.query(query, [id], cb);
};

