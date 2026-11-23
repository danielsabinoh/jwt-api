const bcrypt = require('bcrypt');
const { User, RefreshToken } = require('../models');
const { fail, find, select } = require('../config/http');
const transaction = require('../config/transaction');

function publicUser({ id, name, username, email, isAdmin, active }) {
    return { id, name, username, email, isAdmin, active };
}

async function list() {
    return (await User.findAll({ attributes: { exclude: ['password'] }, order: [['name', 'ASC']] })).map(publicUser);
}

async function userData(body, creating) {
    const data = select(body, ['name', 'username', 'email', 'password']);
    if (data.email) data.email = String(data.email).toLowerCase();
    if (creating || Object.hasOwn(data, 'password')) {
        if (typeof data.password !== 'string' || data.password.length < 6 || Buffer.byteLength(data.password) > 72) {
            fail(400, 'Informe uma senha entre 6 caracteres e 72 bytes.');
        }
        data.password = await bcrypt.hash(data.password, 10);
    }
    return data;
}

async function create(body) {
    return publicUser(await User.create(await userData(body, true)));
}

async function update(id, body) {
    const user = await find(User, id);
    return publicUser(await user.update(await userData(body, false)));
}

async function setActive(id, active) {
    if (typeof active !== 'boolean') fail(400, 'Informe active como verdadeiro ou falso.');
    return transaction(async transaction => {
        const user = await find(User, id, { transaction });
        if (user.isAdmin) fail(409, 'O administrador inicial não pode ser desativado.');
        await user.update({ active }, { transaction });
        if (!active) await RefreshToken.update({ revoked: true }, { where: { userId: user.id }, transaction });
        return publicUser(user);
    });
}

async function seed() {
    if (await User.findOne({ where: { isAdmin: true } })) return;
    const data = await userData({
        name: 'Administrador',
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@biblioteca.com',
        password: process.env.ADMIN_PASSWORD
    }, true);
    await User.create({ ...data, isAdmin: true });
}

module.exports = { list, create, update, setActive, seed, publicUser };
