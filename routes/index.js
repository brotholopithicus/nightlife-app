const express = require('express');
const router = express.Router();

const Place = require('../models/place');

/* GET home page. */
router.get('/', (req, res, next) => {
    Place.find({}, (err, places) => {
        if (err) return next(err);
        return res.render('index', { places });
    });
});

/* GET profile page */
router.get('/profile', (req, res, next) => {
    res.render('profile');
});

/* GET login page */
router.get('/login', (req, res, next) => {
    if (res.locals.user) return res.render('index');
    return res.render('login');
});

/* GET signup page */
router.get('/signup', (req, res, next) => {
    if (res.locals.user) return res.render('index');
    res.render('signup');
});

module.exports = router;
