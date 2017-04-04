const express = require('express');
const router = express.Router();

const yelp = require('yelp-fusion');

router.post('/', (req, res, next) => {
    yelp.accessToken(process.env.YELP_CLIENT_ID, process.env.YELP_CLIENT_SECRET)
        .then(result => {
            yelp.client(result.jsonBody.access_token)
                .search({ location: req.body.search, categories: 'bars', sort_by: 'rating' })
                .then(result => {
                    const places = result.jsonBody.businesses;
                    return res.json(places);
                })
                .catch(err => {
                    return res.json(err);
                });
        })
        .catch(err => {
            return res.json(err);
        });
});

module.exports = router;
