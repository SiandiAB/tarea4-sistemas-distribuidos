"use strict";

const headers = require('./headersCORS');
const { readCollection } = require('./db');

function json(data, statusCode = 200) {
  return {
    statusCode,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

function resourceId(event) {
  const parts = event.path.split('/').filter(Boolean);
  const idx = parts.indexOf('books');
  return parts[idx + 1] || null;
}

// Solo lectura: lista y detalle de libros.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const books = await readCollection('books');
    const id = resourceId(event);

    if (event.httpMethod === 'GET' && !id) {
      return json(books);
    }

    if (event.httpMethod === 'GET' && id) {
      const book = books.find((b) => String(b.id) === id);
      if (!book) return json({ error: 'Book not found' }, 404);
      return json(book);
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.log(error);
    return json({ error: error.message }, 500);
  }
};
