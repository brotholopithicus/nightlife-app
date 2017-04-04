const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const index = require('./routes/index');
const users = require('./routes/users');
const api = require('./routes/api');
const search = require('./routes/search');
const places = require('./routes/places');

const app = express();

require('dotenv').config();

const db = require('./config/db');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    if (!req.cookies.token) {
        res.locals.user = undefined;
        next();
    } else {
        jwt.verify(req.cookies.token, process.env.SECRET, (err, decoded) => {
            if (err) return next(err);
            if (!decoded) return next(Error('Invalid JWT'));
            res.locals.user = decoded._doc;
            next();
        });
    }
});

app.use('/', index);
app.use('/users', users);
app.use('/api', api);
app.use('/search', search);
app.use('/places', places);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
