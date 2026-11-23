require('dotenv').config();
const db = require('../config/db');
const { Loan } = require('../models');
const { today } = require('../loan/loan.service');

async function main() {
    const id = Number(process.argv[2]);
    if (!Number.isInteger(id) || id < 1) throw new Error('Informe o ID do empréstimo de teste.');
    const loan = await Loan.findByPk(id);
    if (!loan || loan.returnDate) throw new Error('Empréstimo em aberto não encontrado.');
    const day = Date.parse(today());
    const dateAgo = days => new Date(day - days * 86400000).toISOString().slice(0, 10);
    await loan.update({ loanDate: dateAgo(9), dueDate: dateAgo(2) });
    console.log('Empréstimo ' + id + ' com 2 dias de atraso.');
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
}).finally(() => db.close());
