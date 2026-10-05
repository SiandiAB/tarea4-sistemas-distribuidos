"use strict";

const headers = require('./headersCORS');
const { readCollection, writeCollection } = require('./db');

// Aplica la eliminacion real de una editorial sobre la base de datos.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const id = parseInt(event.path.split('/').pop(), 10);
    const publishers = readCollection('publishers');
    const remaining = publishers.filter((p) => Number(p.id) !== id);

    if (remaining.length === publishers.length) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Publisher not found' }) };
    }

    writeCollection('publishers', remaining);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, deleted: id }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify({ error: error.message }) };
  }
};
