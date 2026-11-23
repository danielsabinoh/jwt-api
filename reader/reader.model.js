const db = require('../config/db');
const { text, unique, email } = require('../models/fields');

module.exports = db.define('Reader', {
    name: text,
    cpf: unique, email,
    phone: text
});
