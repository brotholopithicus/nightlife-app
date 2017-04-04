const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const placeSchema = new Schema({
    name: String,
    img_url: String,
    id: String,
    attendees: [String]
});

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;
