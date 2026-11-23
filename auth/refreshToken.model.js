const db = require('../config/db');
const { unique, flag } = require('../models/fields');
const { DataTypes } = require('sequelize');

module.exports = db.define('RefreshToken', {
    token: unique,
    expiresAt: { type: DataTypes.DATE,
    allowNull: false },
    revoked: flag(false)
});
