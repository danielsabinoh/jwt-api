const db = require('../config/db');
const { text, date } = require('../models/fields');

module.exports = db.define('Author', {
    name: { ...text },
    nationality: { ...text },
    birthDate: { ...date }
});
