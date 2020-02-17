'use strict';
var async = require('async');
var _ = require('underscore');
var database = require('../lib/database');
var validator = require('validator');

exports.get = function(id, cb){
    var query = 'select * from surveys where id = $1';
    database.query(query, [id], function(err, result){
        if (err) { return cb(err); }
        if (result.rows.length){
            return cb(null, result.rows[0]);
        }
        return cb();
    });
};

exports.list = function(cb){
    var query = 'select * from surveys';
    database.query(query, function(err, result){
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
    var query = 'insert into surveys (name, created_by, published) values ($1, $2, $3) returning id';
    var dataArr = [data.name, data.created_by, data.published];
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
    var query = 'update surveys set name = $2, published = $3 where id = $1';
    var dataArr = [id, data.name, data.published];

    database.query(query, dataArr, cb);
};

exports.delete =  function(id, cb){
    var query = 'delete from surveys where id = $1';
    database.query(query, [id], cb);
};

function validate(data){
    if (! validator.isLength(data.name, 2, 255)){
        return false;
    }
    return true;

}
