const service = require('./book.service');

exports.list = async (req, res) => res.json(await service.list(req.query));
exports.create = async (req, res) => res.status(201).json(await service.create(req.body || {}));
exports.update = async (req, res) => res.json(await service.update(req.params.id, req.body || {}));
exports.remove = async (req, res) => {
    await service.remove(req.params.id);
    res.sendStatus(204);
};
