const express = require('express');
const passport = require('passport');
const _ = require('underscore');

const permission = require('../lib/permission');

function index(req, res, next){
    res.redirect('/survey');
}

function logout(req, res, next){
    req.logout();
    delete req.session.accessToken;
    res.redirect('/');
}

const router = express.Router();

router.get('/', permission('login'), index);
router.get('/login', passport.authenticate('oauth2'));
router.get('/logout', logout);

router.get('/oauth_callback',
    (req, res, next) => {
        if (_.has(req.session, 'backto') && req.session.backto){
            res.locals._backto = req.session.backto;
        }
        passport.authenticate('oauth2', { failureRedirect: '/login', keepSessionInfo:true })(req, res, next);
    },
    (req, res) => {
        // Successful authentication, redirect home.
        if (_.has(res.locals, '_backto')){
            const backto = res.locals._backto;
            delete res.locals._backto;
            res.redirect(backto);
        } else {
            res.redirect('/');
        }
    });

module.exports = router;
