const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('express-flash');
const session = require('express-session');
const config = require('config');
const _ = require('underscore');
const moment = require('moment');
const methodOverride = require('method-override');
const redis = require('redis');
const {marked} = require('marked');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;

const models = require('./lib/models');

const Intercode = require('./lib/intercode');
const permission = require('./lib/permission');
const database = require('./lib/database');

const surveyHelper = require('./lib/survey-helper');

const indexRouter = require('./routes/index');
const surveyRouter = require('./routes/survey');
const feedbackRouter = require('./routes/feedback');
const responseRouter = require('./routes/response');
const questionRouter = require('./routes/question');

const app = express();

// if running in SSL Only mode, redirect to SSL version
if (config.get('app.secureOnly')){
    app.all('*', function(req, res, next){
        if (req.originalUrl.match(/\/insecure-api\//)){
            return next();
        }
        if (req.headers['x-forwarded-proto'] !== 'https') {
            res.redirect('https://' + req.headers.host + req.url);
        } else {
            next();
        }
    });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

if (config.get('app.logRequests')){
    app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
        const method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: config.get('app.sessionSecret'),
    rolling: true,
    saveUninitialized: true,
    resave: false,
};

switch (config.get('app.sessionType')){
    case 'redis': {
        const RedisStore = require('connect-redis').default;

        let redisClient = null;
        if (config.get('app.redis.url')){
            const options = {
                url: config.get('app.redis.url')
            };
            if (config.get('app.redis.tls')){
                options.tls = {rejectUnauthorized: false};
            }
            redisClient = redis.createClient(options);
        } else {
            redisClient = redis.createClient();
        }
        redisClient.on('connect', function() {
            console.log('Using redis for sessions');
        });
        redisClient.on('error', err => {
            console.log('Error ' + err);
        });

        (async() => {
            await redisClient.connect().catch(console.error);
        })();

        sessionConfig.store = new RedisStore({ client: redisClient });
        sessionConfig.resave = true;
        break;
    }

    case 'postgresql': {
        const pgSession = require('connect-pg-simple')(session);
        sessionConfig.store = new pgSession({
            pool: database.pool,
            tableName: 'session'
        });
        console.log('Using postgresql for sessions');
        break;
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(function(req, res, next){
    req.models = models;
    next();
});

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(async function(req, id, cb) {
    try{
        const user = await models.user.get(id);
        cb(null, user);
    } catch (err){
        cb(err);
    }
});

const passportClient = new OAuth2Strategy(config.get('auth'),
    async function(req, accessToken, refreshToken, profile, cb) {
        try {
            const user = await models.user.findOrCreate({
                name: profile.name,
                intercode_id: profile.id,
                email: profile.email
            });
            req.session.accessToken = accessToken;
            cb(null, user);
        } catch (err) {
            console.trace(err);
            cb(err);
        }
    }
);

passportClient.userProfile = async function (token, cb) {
    const intercode = new Intercode(token);
    try {
        const data = await intercode.getUser();
        cb(null, data.currentUser);
    } catch (err) {
        cb(err);
    }
};

passport.use(passportClient);

app.use(permission());


// Setup intercode connection for routes

app.use(async function(req, res, next){
    if (req.session.accessToken && req.user && !req.originalUrl.match(/^\/log(in|out)/) ){
        req.intercode = new Intercode(req.session.accessToken);
        next();
    } else {
        next();
    }
});


// Set common helpers for the view
app.use(function(req, res, next){
    res.locals.config = config;
    res.locals.session = req.session;
    res.locals.title = config.get('app.name');
    res.locals._ = _;
    res.locals.moment = moment;
    res.locals.marked = marked;
    res.locals.humanize = surveyHelper.humanize;
    res.locals.teamMembers = surveyHelper.teamMembers;
    res.locals.activeUser = req.user;
    res.locals.capitalize = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    next();
});

app.use('/', indexRouter);
app.use('/survey', surveyRouter);
app.use('/feedback', feedbackRouter);
app.use('/response', responseRouter);
app.use('/question', questionRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    if (req.app.get('env') === 'development'){
        console.error('Requested: ' + req.originalUrl);
    }
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    if (req.app.get('env') === 'development' && err.status !== 404){
        console.trace(err);
    }
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
