"use strict";

const headers = require('./headersCORS');
const { readCollection, writeCollection } = require('./db');

// Aplica la eliminacion real de un libro sobre la base de datos.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const id = parseInt(event.path.split('/').pop(), 10);
    const books = readCollection('books');
    const remaining = books.filter((b) => Number(b.id) !== id);

    if (remaining.length === books.length) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Book not found' }) };
    }

    writeCollection('books', remaining);

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
