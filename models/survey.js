'use strict';
const validator = require('validator');
const Model = require('../lib/Model');

const models = {
    question: require('./question')
};
const tableFields = [
    'id',
    'name',
    'description',
    'base_url',
    'created_by',
    'created',
    'published',
    'css',
    'body_font',
    'header_font',
    'brand_font'
];

const Survey = new Model('surveys', tableFields, {
    order: ['published desc', 'name'],
    validator: validate,
    postSelect: fill
});

module.exports = Survey;

function validate(data){
    if (! validator.isLength(data.name, 2, 255)){
        return false;
    }
    return true;
}

async function fill(record){
    record.questions = await models.question.find({survey_id:record.id});
    return record;
}
