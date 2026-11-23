const { Op } = require('sequelize');
const { Book, Loan } = require('../models');
const { today } = require('../loan/loan.service');

async function dashboard() {
    const day = today();
    const [totalBooks, borrowed, active, late, fines] = await Promise.all([
        Book.count(),
        Loan.count({ where: { returnDate: null } }),
        Loan.count({ where: { dueDate: { [Op.gte]: day }, returnDate: null } }),
        Loan.count({ where: { dueDate: { [Op.lt]: day }, returnDate: null } }),
        Loan.sum('fine')
    ]);
    return { totalBooks, borrowed, active, late, fines: fines || 0 };
}

module.exports = { dashboard };
