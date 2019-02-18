'use strict';
var async = require('async');
var _ = require('underscore');
var database = require('../lib/database');
var validator = require('validator');

exports.get = function(id, cb){
    var query = 'select * from feedback where id = $1';
    database.query(query, [id], function(err, result){
        if (err) { return cb(err); }
        if (result.rows.length){
            return cb(null, result.rows[0]);
        }
        return cb();
    });
};

exports.listByResponse = function(response_id, cb){
    var query = 'select * from feedback where response_id = $1';
    database.query(query, [response_id], function(err, result){
        if (err) { return cb(err); }
        return cb(null, result.rows);
    });
};

exports.listByEvent = function(event_id, cb){
    var query = 'select * from feedback where event_id = $1';
    database.query(query, [event_id], function(err, result){
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
    var query = 'insert into feedback (response_id, event_id, concom, gm, recommend) values ($1, $2, $3, $4, $5) returning id';
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
    var query = 'update feed set concom = $2, gm = $3, recommend = $4 where id = $1';
    var dataArr = [id, data.concom, data.gm, data.recommend];

    database.query(query, dataArr, cb);
};

exports.delete =  function(id, cb){
    var query = 'delete from feedback where id = $1';
    database.query(query, [id], cb);
};

function validate(data){
    if (! validator.isNumeric('' + data.response_id)){
        return false;
    }
    if (! validator.isNumeric('' + data.event_id)){
        return false;
    }
    if (! validator.isNumeric('' + data.recommend)){
        return false;
    }

    return true;
}
