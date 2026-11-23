const { Author } = require('../models');
const crud = require('../config/crud');
const { fail } = require('../config/http');

const service = crud(Author, ["name","nationality","birthDate"]);

exports.remove = id => service.remove(id, async (row, transaction) => {
    if (await row.countBooks({ transaction })) fail(409, 'Existem livros vinculados a este registro.');
});

exports.list = service.list;
exports.create = service.create;
exports.update = service.update;
