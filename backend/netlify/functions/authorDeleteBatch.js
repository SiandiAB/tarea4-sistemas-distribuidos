"use strict";

const headers = require('./headersCORS');
const { readCollection, writeCollection } = require('./db');

// Aplica la eliminacion real de un autor sobre la base de datos.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const id = parseInt(event.path.split('/').pop(), 10);
    const authors = readCollection('authors');
    const remaining = authors.filter((a) => Number(a.id) !== id);

    if (remaining.length === authors.length) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Author not found' }) };
    }

    writeCollection('authors', remaining);

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
