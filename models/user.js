const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const saltRounds = 10;

const userSchema = new Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    updatedAt: { type: Date, default: Date.now() },
    attending: String
});

userSchema.pre('save', function(next) {
    const user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        if (err) return cb(err);
        cb(null, result);
    });
}

const User = mongoose.model('User', userSchema);
module.exports = User;
