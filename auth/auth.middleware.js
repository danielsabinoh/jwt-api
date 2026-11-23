const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { fail } = require('../config/http');

async function authenticate(req, res, next) {
    const match = /^Bearer (\S+)$/i.exec(req.get('authorization') || '');
    if (!match) fail(401, 'Sessão necessária.');
    let payload;
    try {
        payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch {
        fail(401, 'Token inválido ou expirado.');
    }
    req.user = await User.findByPk(payload.id);
    if (!req.user?.active) fail(401, 'Sessão indisponível.');
    next();
}

function isAdmin(req, res, next) {
    if (!req.user.isAdmin) fail(403, 'Acesso exclusivo do administrador.');
    next();
}

module.exports = { authenticate, isAdmin };
