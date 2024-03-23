'use strict';
const _ = require('underscore');
const config = require('config');

module.exports = function(permission, redirect){
    return async function(req, res, next){
        if (! (_.has(req, 'user') && _.has(req, 'intercode'))){
            res.locals.checkPermission = getCheckPermission(req, {
                permissions: {
                    privileges: [],
                    positions: []
                },
                events:[]
            });
            if (!permission){ return next(); }
            return fail(req, res, 'not logged in', redirect);

        } else {
            try {
                const permissions = await req.intercode.getAllPermissions(req.user.intercode_id);
                res.locals.checkPermission = getCheckPermission(req, {permissions: permissions});
                if (!permission){ return next(); }

                if (check(req, {permissions: permissions, events:[]}, permission)){
                    return next();
                }
                return fail(req, res, 'permission fail', redirect);
            } catch (err) {
                return next(err);
            }
        }
    };
};

function getCheckPermission(req, data){
    return function checkPermission(permission, baseUrl, eventId){
        const request = {
            permission: permission,
            eventId: eventId
        };
        if (baseUrl){
            request.domain =  new URL(baseUrl).hostname;
        }
        return check(req, data, request);
    };
}

function fail(req, res, reason, redirect){
    if (reason === 'not logged in'){
        if (req.originalUrl.match(/\/api\//)){
            res.header('WWW-Authenticate', 'Basic realm="feedbacker"');
            res.status(401).send('Authentication required');
        } else {
            if (!req.session.backto &&
                ! req.originalUrl.match(/\/login/) &&
                ! req.originalUrl.match(/^\/$/) ){
                req.session.backto = req.originalUrl;
            }
            res.redirect('/login');
        }
    } else {
        if (redirect){
            req.flash('error', 'You are not allowed to access that resource');
            res.redirect(redirect);
        } else {
            res.status('403').send('Forbidden');
        }
    }
}

function check(req, data, permission){
    const user = req.user;

    let domain = null;
    let eventId = null;

    if (user && user.locked){
        return false;
    }

    if (typeof(permission) === 'object'){
        if (_.has(permission, 'domain')){
            domain = permission.domain;
        }
        if (_.has(permission, 'eventId')){
            eventId = permission.eventId;
        }
        if (_.has(permission, 'permission')){
            permission = permission.permission;
        }
    }
    if (typeof permission !== 'string'){
        return false;
    }

    // Check to see if logged in
    if (permission === 'login'){
        if (user) {
            return true;
        }
    // Site admin get all permissions
    } if (data.permissions.privileges.indexOf('site_admin') !== -1){
        return true;
    } else if (domain){
        return checkForPosition(permission, data.permissions.positions[domain]);

    } else {
        for (const domain in data.permissions.positions ){
            if (checkForPosition(permission, data.permissions.positions[domain])){
                return true;
            }
        }
        return false;
    }
}

function checkForPosition(permission, positions){
    if (!positions || !positions.length){ return false;}
    if (permission === 'none'){
        return false;
    }
    for (const position of config.get('staffPositions')){
        if (positions.indexOf(position) !== -1 ){
            return true;
        }
    }
    if (permission === 'any' && positions.length){
        return true;
    }
    if (positions.indexOf(permission) !== -1){
        return true;
    }
    return false;
}
