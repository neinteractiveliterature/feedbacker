'use strict';
const validator = require('validator');
const Model = require('../lib/Model');

const models = {
    feedback: require('./feedback'),
    question_response: require('./question_response')
};
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
    validator: validate,
    postSelect: fill
});

module.exports = Response;

function validate(data){
    return true;
}


async function fill(record){
    record.feedback =  await models.feedback.find({response_id: record.id});
    record.responses = await models.question_response.find({response_id: record.id});
    return record;
}
