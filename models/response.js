'use strict';
const validator = require('validator');
const Model = require('../lib/Model');

const tableFields = [
    'id',
    'survey_id',
    'user_id',
    'anonymous',
    'complete',
    'tag',
    'created',
    'updated'
];

const Response = new Model('responses', tableFields, {
    order: ['updated'],
    validator: validate
});

module.exports = Response;

function validate(data){
    return true;
}
