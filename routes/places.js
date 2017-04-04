const express = require('express');
const router = express.Router();

const yelp = require('yelp-fusion');

const Place = require('../models/place');

/* GET place list */
router.get('/', async(req, res, next) => {
    const options = { location: 'Miama, FL', categories: 'bars', sort_by: 'rating' };
    // const options = { location: req.body.search, categories: 'bars', sort_by: 'rating' };
    const yelpClient = await initYelpClient(process.env.YELP_CLIENT_ID, process.env.YELP_CLIENT_SECRET);
    yelpClient.search(options)
        .then(result => {
            const places = parseResult(result.jsonBody.businesses);
            return res.json(places);
        })
        .catch(err => {
            return res.json(err);
        });
});

/* GET place by id */
router.get('/:id', async(req, res, next) => {
    const yelpClient = await initYelpClient(process.env.YELP_CLIENT_ID, process.env.YELP_CLIENT_SECRET);
    const result = await findBusiness(req.params.id, yelpClient);
    return res.json(result);
});

/* POST add place to db */
router.post('/:id', async(req, res, next) => {
    const placeId = req.params.id;
    const userId = res.locals.user._id;
    const exists = await alreadyInDatabase(placeId);
    let place;
    if (exists) {
        place = await updateExistingPlace(placeId);
    } else {
        place = await createNewPlace(placeId, userId);
    }
    return res.json(place);
});

function alreadyInDatabase(id) {
    return new Promise((resolve, reject) => {
        Place.findOne({ id }, (err, doc) => {
            if (err) return reject(err);
            if (!doc) return resolve(false);
            return resolve(true);
        });
    });
}

function createNewPlace(placeId, userId) {
    return new Promise(async(resolve, reject) => {
        const yelpClient = await initYelpClient(process.env.YELP_CLIENT_ID, process.env.YELP_CLIENT_SECRET);
        const yelpData = await findBusiness(placeId, yelpClient);
        const newPlaceData = processYelpData(yelpData, userId);
        const place = new Place(newPlaceData);
        place.save(err => {
            if (err) return reject(err);
            return resolve(place);
        });
    });
}

function processYelpData(data, userId) {
    return {
        name: data.name,
        img_url: data.image_url,
        id: data.id,
        attendees: [userId]
    }
}

function updateExistingPlace(id) {
    return new Promise((resolve, reject) => {
        Place.findOne({ id: placeId }, (err, doc) => {
            if (err) return reject(err);
            return resolve(doc);
        });
    });
}

function findBusiness(id, yelpClient) {
    return new Promise((resolve, reject) => {
        yelpClient.business(id)
            .then(result => {
                return resolve(result.jsonBody);
            })
            .catch(err => {
                return reject(err)
            });
    })
}

function initYelpClient(id, secret) {
    return new Promise((resolve, reject) => {
        yelp.accessToken(id, secret)
            .then(result => {
                resolve(yelp.client(result.jsonBody.access_token));
            })
            .catch(err => {
                reject(err);
            });
    });
}


function parseResult(data) {
    if (typeof data === 'string') data = JSON.parse(data);
    return data.map(place => {
        return { name: place.name, image_url: place.image_url, id: place.id }
    });
}

module.exports = router;
