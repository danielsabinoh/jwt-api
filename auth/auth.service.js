const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
const { User, RefreshToken } = require('../models');
const { publicUser } = require('../user/user.service');
const { fail } = require('../config/http');
const transaction = require('../config/transaction');

async function issue(user, transaction) {
    const { id, name, email, isAdmin } = user;
    const accessToken = jwt.sign({ id, name, email, isAdmin }, process.env.JWT_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_TTL || '15m'
    });
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d', jwtid: randomUUID()
    });
    await RefreshToken.create({
        token: refreshToken, userId: id, expiresAt: new Date(jwt.decode(refreshToken).exp * 1000)
    }, { transaction });
    return { accessToken, refreshToken, user: publicUser(user) };
}

async function login({ email, password }) {
    if (typeof email !== 'string' || typeof password !== 'string') fail(400, 'Informe e-mail e senha.');
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user || !user.active || !(await bcrypt.compare(password, user.password))) {
        fail(401, 'E-mail ou senha inválidos, ou conta desativada.');
    }
    return transaction(async transaction => {
        await user.reload({ transaction });
        if (!user.active) fail(401, 'Conta desativada.');
        return issue(user, transaction);
    });
}

async function refresh(token) {
    if (typeof token !== 'string' || !token) fail(401, 'Refresh token inválido.');
    const result = await transaction(async transaction => {
        const saved = await RefreshToken.findOne({ where: { token }, transaction });
        if (!saved) return null;
        if (saved.revoked) {
            await RefreshToken.update({ revoked: true }, { where: { userId: saved.userId }, transaction });
            return null;
        }
        if (saved.expiresAt <= new Date()) return null;
        jwt.verify(token, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
        const user = await User.findByPk(saved.userId, { transaction });
        if (!user?.active) return null;
        await saved.update({ revoked: true }, { transaction });
        return issue(user, transaction);
    });
    if (!result) fail(401, 'Refresh token inválido ou encerrado.');
    return result;
}

async function logout(userId, token) {
    if (typeof token !== 'string' || !token) fail(400, 'Informe o refresh token.');
    await RefreshToken.update({ revoked: true }, { where: { userId, token } });
}

module.exports = { login, refresh, logout };
