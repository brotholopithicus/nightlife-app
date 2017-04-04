const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const config = require('./config');
mongoose.connect(config.db);

const db = mongoose.connection;

db.on('error', console.error.bind(console, `Error Connecting to DB.`));
db.once('open', () => console.log('Connected to DB.'));

module.exports = db;
