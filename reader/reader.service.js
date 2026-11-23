const { Reader } = require('../models');
const crud = require('../config/crud');
const { find } = require('../config/http');
const loans = require('../loan/loan.service');

const service = crud(Reader, ["name","cpf","email","phone"]);

exports.history = async id => {
    await find(Reader, id);
    return loans.list({ readerId: id });
};

exports.list = service.list;
exports.create = service.create;
exports.update = service.update;
