const db = require('../config/db');
const { text, unique, integer } = require('../models/fields');

module.exports = db.define('Book', {
    title: { ...text },
    isbn: { ...unique },
    year: integer(1),
    totalCopies: integer(1),
    availableCopies: integer(0)
});
