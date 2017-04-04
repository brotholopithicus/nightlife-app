const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const User = require('../models/user');

/* GET users listing. */
router.get('/', (req, res, next) => {
    User.find({}, (err, users) => {
        if (err) return next(err);
        return res.json(users);
    });
});

/* POST create new user */
router.post('/', (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) return next(err);
        if (user) return next(Error('Email Address is already registered.'));
        const newUser = new User({ name: req.body.name, username: req.body.username, email: req.body.email, password: req.body.password });
        newUser.save((err) => {
            if (err) return next(err);
            res.redirect('/login');
        });
    });
});

/* POST login user */
router.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) return next(err);
        if (!user) return next(Error('User Account Not Found'));
        user.comparePassword(req.body.password, (err, result) => {
            if (err) return next(err);
            if (!result) return next(Error('Incorrect Password'));
            const token = jwt.sign(user, process.env.SECRET, { expiresIn: '24h' });
            res.cookie('token', token);
            res.redirect('/');
        });
    });
});

/* GET logout user */
router.get('/logout', (req, res, next) => {
    res.clearCookie('token');
    res.redirect('/');
});

/* GET single user */
router.get('/:id', (req, res, next) => {
    User.findById(req.params.id, (err, user) => {
        if (err) return next(err);
        return res.json(user);
    });
});

module.exports = router;
