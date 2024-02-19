'use strict';
const validator = require('validator');
const Model = require('../lib/Model');

const tableFields = [
    'id',
    'question_id',
    'response_id',
    'value',
    'created'
];

const QuestionResponse = new Model('question_responses', tableFields, {
    order: ['created'],
    validator: validate
});

module.exports = QuestionResponse;

function validate(data){
    if (! validator.isNumeric('' + data.response_id)){
        return false;
    }
    if (! validator.isNumeric('' + data.question_id)){
        return false;
    }

    return true;
}
