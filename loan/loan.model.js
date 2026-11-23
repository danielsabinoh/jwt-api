const db = require('../config/db');
const { date } = require('../models/fields');
const { DataTypes } = require('sequelize');

module.exports = db.define('Loan', {
    loanDate: date,
    dueDate: date,
    returnDate: DataTypes.DATEONLY,
    status: DataTypes.ENUM('ATIVO', 'ATRASADO', 'DEVOLVIDO'),
    fine: { type: DataTypes.INTEGER,
    defaultValue: 0 }
});
