const { Transaction } = require('sequelize');
const db = require('./db');

module.exports = action => db.transaction({ type: Transaction.TYPES.IMMEDIATE }, action);
