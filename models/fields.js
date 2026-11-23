const { DataTypes } = require('sequelize');

const text = { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true, len: [1, 255] } };
const unique = { ...text, unique: true };
const date = { type: DataTypes.DATEONLY, allowNull: false, validate: { isDate: true } };
const integer = min => ({ type: DataTypes.INTEGER, allowNull: false, validate: { isInt: true, min } });
const email = { ...text, validate: { ...text.validate, isEmail: true } };
const flag = defaultValue => ({ type: DataTypes.BOOLEAN, allowNull: false, defaultValue });

module.exports = { text, unique, date, integer, email, flag };
