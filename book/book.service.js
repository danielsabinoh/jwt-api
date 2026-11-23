const { Op } = require('sequelize');
const { Author, Book, Category, Loan } = require('../models');
const { fail, find, select } = require('../config/http');
const transaction = require('../config/transaction');

const include = [Category, { model: Author, through: { attributes: [] } }];

async function list(query) {
    const where = {};
    if (query.title) where.title = { [Op.like]: '%' + query.title + '%' };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.available === 'true') where.availableCopies = { [Op.gt]: 0 };
    const books = await Book.findAll({ where, include, order: [['title', 'ASC']] });
    if (!query.authorId) return books;
    return books.filter(book => book.Authors.some(author => String(author.id) === query.authorId));
}

async function save(id, body) {
    return transaction(async transaction => {
        const data = select(body, ['title', 'isbn', 'year', 'totalCopies', 'categoryId']);
        const old = id ? await find(Book, id, { transaction }) : null;
        const occupied = old ? old.totalCopies - old.availableCopies : 0;
        const total = data.totalCopies ?? old?.totalCopies;
        if (!Number.isInteger(total) || total < 1) fail(400, 'Informe um total inteiro de exemplares maior que zero.');
        if (total < occupied) fail(409, 'O total é menor que o número de exemplares emprestados.');
        if (!old || Object.hasOwn(data, 'categoryId')) {
            if (!await Category.findByPk(data.categoryId, { transaction })) fail(400, 'Selecione uma categoria válida.');
        }
        let authors;
        if (!old || Object.hasOwn(body, 'authorIds')) {
            if (!Array.isArray(body.authorIds) || !body.authorIds.length || !body.authorIds.every(Number.isInteger)) {
                fail(400, 'Selecione ao menos um autor válido.');
            }
            const ids = [...new Set(body.authorIds)];
            authors = await Author.findAll({ where: { id: ids }, transaction });
            if (authors.length !== ids.length) fail(400, 'Selecione autores válidos.');
        }
        data.availableCopies = total - occupied;
        const book = old ? await old.update(data, { transaction }) : await Book.create(data, { transaction });
        if (authors) await book.setAuthors(authors, { transaction });
        return book.reload({ include, transaction });
    });
}

function remove(id) {
    return transaction(async transaction => {
        const book = await find(Book, id, { transaction });
        if (await Loan.count({ where: { bookId: id }, transaction })) {
            fail(409, 'O livro possui histórico de empréstimos.');
        }
        await book.destroy({ transaction });
    });
}

module.exports = { list, create: body => save(null, body), update: save, remove };
