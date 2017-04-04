const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Place = require('../models/place');

/* GET business list */
router.get('/places', (req, res, next) => {
    Place.find({}, (err, places) => {
        if (err) return next(err);
        return res.json(places);
    });
});

router.get('/places/:id', (req, res, next) => {
    Place.findById(req.params.id, (err, place) => {
        if (err) return next(err);
        return res.json(place);
    });
});

/* POST attend place */
router.post('/places/:id', (req, res, next) => {
    // find all places that have current user id in their attendees array
    Place.findOne({ attendees: { $in: [res.locals.user._id] } }, (err, result) => {
        if (err) return next(err);
        // if none are found skip to updating attendees array of new place otherwise remove all instances from old place attendees array
        if (!result) return updatePlaceAttendance(req, res, next);
        result.attendees = result.attendees.filter(attendee => attendee !== res.locals.user._id);
        result.save(err => {
            if (err) return next(err);
            return updatePlaceAttendance(req, res, next);
        });
    });
});

function updatePlaceAttendance(req, res, next) {
    Place.findById(req.params.id, (err, place) => {
        if (err) return next(err);
        place.attendees.push(res.locals.user._id);
        place.save(err => {
            if (err) return next(err);
            User.findById(res.locals.user._id, (err, user) => {
                user.attending = req.params.id;
                user.save(err => {
                    if (err) return next(err);
                    return res.json({ user, place });
                });
            });
        });
    });
}

// TODO: add route to remove attendance from place

module.exports = router;
