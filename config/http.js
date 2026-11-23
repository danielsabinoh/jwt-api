function fail(status, message) {
    throw Object.assign(new Error(message), { status });
}

function select(body, fields) {
    return Object.fromEntries(fields.filter(field => Object.hasOwn(body, field)).map(field => [
        field,
        typeof body[field] === 'string' && field !== 'password' ? body[field].trim() : body[field]
    ]));
}

async function find(model, id, options) {
    const row = await model.findByPk(id, options);
    if (!row) fail(404, 'Registro não encontrado.');
    return row;
}

module.exports = { fail, select, find };
