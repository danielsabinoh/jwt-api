require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { seed } = require('./user/user.service');

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3001', credentials: true }));
app.use(express.json());

app.use('/v1/auth', require('./auth/auth.router'));
app.use('/v1/user', require('./user/user.router'));
app.use('/v1/categories', require('./category/category.router'));
app.use('/v1/authors', require('./author/author.router'));
app.use('/v1/books', require('./book/book.router'));
app.use('/v1/readers', require('./reader/reader.router'));
app.use('/v1/loans', require('./loan/loan.router'));
app.use('/v1/reports', require('./report/report.router'));

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Já existe um registro com esse valor.' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ message: 'O registro possui vínculos ou a referência é inválida.' });
    }
    if (error.name === 'SequelizeValidationError') {
        const fields = error.errors.map(item => item.path).join(', ');
        return res.status(400).json({ message: 'Confira os campos: ' + fields + '.' });
    }
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error(error);
    res.status(500).json({ message: 'Erro interno da biblioteca.' });
});

async function start() {
    const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;
    if (!JWT_SECRET || !JWT_REFRESH_SECRET || JWT_SECRET === JWT_REFRESH_SECRET) {
        throw new Error('Configure duas chaves JWT diferentes no .env.');
    }
    await db.sync();
    await seed();
    app.listen(port, 'localhost', () => console.log('API em http://localhost:' + port));
}

start().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
