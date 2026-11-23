const service = require('./loan.service');

exports.list = async (req, res) => res.json(await service.list({ status: req.query.status }));
exports.create = async (req, res) => res.status(201).json(await service.create(req.body || {}, req.user.id));
exports.returnBook = async (req, res) => res.json(await service.returnBook(req.params.id));
