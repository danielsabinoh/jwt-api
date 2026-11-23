const db = require('../config/db');
const { unique, text } = require('../models/fields');

module.exports = db.define('Category', {
    name: unique,
    description: text
});
