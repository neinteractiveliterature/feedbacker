'use strict';
const async = require('async');
const _ = require('underscore');
const database = require('../lib/database');
const validator = require('validator');
const cache = require('../lib/cache');
const models = {
};

const tableFields = ['name', 'email', 'intercode_id'];

exports.get = async function(id){
    if (!id){ throw new Error('no id specified'); }
    let user = await cache.check('user', id);

    const query = 'select * from users where id = $1';
    const result = await database.query(query, [id]);
    if (result.rows.length){
        user = result.rows[0];
        await cache.store('user', id, user);

        return user;
    }
    return;
};

exports.find = async function(conditions = {}, options = {}){
    const queryParts = [];
    const queryData = [];
    for (const field of tableFields){
        if (_.has(conditions, field)){
            queryParts.push(field + ' = $' + (queryParts.length+1));
            queryData.push(conditions[field]);
        }
    }
    let query = 'select * from users';
    if (queryParts.length){
        query += ' where ' + queryParts.join(' and ');
    }
    query += ' order by name';

    if (_.has(options, 'offset')){
        query += ` offset ${Number(options.offset)}`;
    }

    if (_.has(options, 'limit')){
        query += ` limit ${Number(options.limit)}`;
    }
    const result = await database.query(query, queryData);
    return result.rows;
};

exports.findOne = async function( conditions, options = {}){
    options.limit = 1;
    const results = await exports.find(conditions, options);
    if (results.length){
        return results[0];
    }
    return;
};

exports.create = async function(data){
    if (! validate(data)){
        throw new Error('Invalid Data');
    }
    const queryFields = [];
    const queryData = [];
    const queryValues = [];
    for (const field of tableFields){
        if (_.has(data, field)){
            queryFields.push(field);
            queryValues.push('$' + queryFields.length);
            queryData.push(data[field]);
        }
    }

    let query = 'insert into users (';
    query += queryFields.join (', ');
    query += ') values (';
    query += queryValues.join (', ');
    query += ') returning id';

    const result = await database.query(query, queryData);
    return result.rows[0].id;
};

exports.update = async function(id, data){
    if (! validate(data)){
        throw new Error('Invalid Data');
    }
    const queryUpdates = [];
    const queryData = [id];
    for (const field of tableFields){
        if (_.has(data, field)){
            queryUpdates.push(field + ' = $' + (queryUpdates.length+2));
            queryData.push(data[field]);
        }
    }

    let query = 'update users set ';
    query += queryUpdates.join(', ');
    query += ' where id = $1';
    if (queryData.length > 1){
        await database.query(query, queryData);
        await cache.invalidate('user', id);
    }
};

exports.delete =  async function(id){
    const query = 'delete from users where id = $1';
    await database.query(query, [id]);
    await cache.invalidate('user', id);
};

exports.findOrCreate = async function(data){

    const user = await exports.findOne({intercode_id: data.intercode_id});
    if (user) {
        await exports.update(user.id, data);
        return await exports.get(user.id);
    } else {
        const id = await exports.create(data);
        return await exports.get(id);
    }
};

function validate(data){
    if (! validator.isLength(data.name, 2, 255)){
        return false;
    }
    if (! validator.isLength(data.email, 3, 100)){
        return false;
    }
    return true;
}
