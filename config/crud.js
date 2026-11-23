const { find, select } = require('./http');
const transaction = require('./transaction');

module.exports = (model, fields) => ({
    list: () => model.findAll({ order: [['name', 'ASC']] }),
    create: body => model.create(select(body, fields)),
    update: async (id, body) => {
        const row = await find(model, id);
        return row.update(select(body, fields));
    },
    remove: (id, check) => transaction(async transaction => {
        const row = await find(model, id, { transaction });
        await check(row, transaction);
        await row.destroy({ transaction });
    })
});
