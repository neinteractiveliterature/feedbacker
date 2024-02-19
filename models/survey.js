'use strict';
const validator = require('validator');
const Model = require('../lib/Model');

const tableFields = [
    'id',
    'name',
    'created_by',
    'created',
    'published'
];

const Survey = new Model('surveys', tableFields, {
    order: ['name'],
    validator: validate
});

module.exports = Survey;

function validate(data){
    if (! validator.isLength(data.name, 2, 255)){
        return false;
    }
    return true;

}
