const { Op } = require('sequelize');
const { Book, Reader, User, Loan } = require('../models');
const { fail, find } = require('../config/http');
const transaction = require('../config/transaction');

const oneDay = 86400000;
const include = [Book, Reader, { model: User, attributes: ['id', 'name'] }];

function today() {
    const now = new Date();
    return new Date(now.valueOf() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function view(loan, day) {
    const data = loan.toJSON();
    data.status = data.returnDate ? 'DEVOLVIDO' : data.dueDate < day ? 'ATRASADO' : 'ATIVO';
    return data;
}

async function list({ status, readerId } = {}) {
    const where = readerId ? { readerId } : {};
    const day = today();
    if (status === 'DEVOLVIDO') where.returnDate = { [Op.ne]: null };
    if (status === 'ATIVO' || status === 'ATRASADO') {
        where.returnDate = null;
        where.dueDate = status === 'ATIVO' ? { [Op.gte]: day } : { [Op.lt]: day };
    }
    if (status && !['DEVOLVIDO', 'ATIVO', 'ATRASADO'].includes(status)) fail(400, 'Status inválido.');
    const loans = await Loan.findAll({ where, include, order: [['id', 'DESC']] });
    return loans.map(loan => view(loan, day));
}

function create({ bookId, readerId }, userId) {
    return transaction(async transaction => {
        if (!Number.isInteger(bookId) || !Number.isInteger(readerId)) fail(400, 'Selecione um livro e um leitor.');
        const book = await find(Book, bookId, { transaction });
        await find(Reader, readerId, { transaction });
        if (book.availableCopies <= 0) fail(409, 'Livro sem exemplares disponíveis.');
        const day = today();
        const current = await Loan.findAll({ where: { readerId, returnDate: null }, transaction });
        if (current.some(loan => loan.dueDate < day)) fail(409, 'O leitor tem um empréstimo atrasado.');
        if (current.length >= 3) fail(409, 'O leitor já tem três empréstimos em aberto.');
        const dueDate = new Date(Date.parse(day) + 7 * oneDay).toISOString().slice(0, 10);
        const loan = await Loan.create({
            bookId, readerId, userId, loanDate: day, dueDate, status: 'ATIVO'
        }, { transaction });
        await book.decrement('availableCopies', { transaction });
        return loan;
    });
}

function returnBook(id) {
    return transaction(async transaction => {
        const loan = await find(Loan, id, { transaction });
        if (loan.returnDate) fail(409, 'Este empréstimo já foi devolvido.');
        const book = await find(Book, loan.bookId, { transaction });
        const day = today();
        const fine = Math.max(0, (Date.parse(day) - Date.parse(loan.dueDate)) / oneDay);
        await loan.update({ returnDate: day, status: 'DEVOLVIDO', fine }, { transaction });
        await book.increment('availableCopies', { transaction });
        return loan;
    });
}

module.exports = { list, create, returnBook, today };
