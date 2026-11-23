const auth = require('./auth.service');
const { publicUser } = require('../user/user.service');

exports.login = async (req, res) => res.json(await auth.login(req.body || {}));
exports.refresh = async (req, res) => res.json(await auth.refresh(req.body?.refreshToken));
exports.logout = async (req, res) => {
    await auth.logout(req.user.id, req.body?.refreshToken);
    res.sendStatus(204);
};
exports.me = (req, res) => res.json(publicUser(req.user));
