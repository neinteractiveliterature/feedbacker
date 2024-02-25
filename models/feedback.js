'use strict';
const validator = require('validator');
const Model = require('../lib/Model');

const tableFields = [
    'id',
    'response_id',
    'event_id',
    'concom',
    'gm',
    'recommend',
    'gm_use_name',
    'skipped',
    'created'
];

const Feedback = new Model('feedback', tableFields, {
    order: ['created'],
    validator: validate
});

module.exports = Feedback;

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



