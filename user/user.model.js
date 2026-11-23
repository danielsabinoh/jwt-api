const db = require('../config/db');
const { text, unique, email, flag } = require('../models/fields');

module.exports = db.define('User', {
    name: { ...text },
    username: { ...unique },
    email: { ...email,
    unique: true },
    password: { ...text },
    isAdmin: flag(false),
    active: flag(true)
});
