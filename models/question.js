'use strict';
const validator = require('validator');
const Model = require('../lib/Model');

const tableFields = [
    'id',
    'survey_id',
    'question',
    'description',
    'type',
    'display_order',
    'required'
];

const Question = new Model('questions', tableFields, {
    order: ['display_order'],
    validator: validate
});

module.exports = Question;

function validate(data){
    if (! validator.isLength(data.question, 2, 255)){
        return false;
    }
    return true;
}
