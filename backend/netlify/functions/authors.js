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
  const idx = parts.indexOf('authors');
  return parts[idx + 1] || null;
}

// Solo lectura: lista y detalle de autores.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const authors = readCollection('authors');
    const id = resourceId(event);

    if (event.httpMethod === 'GET' && !id) {
      return json(authors);
    }

    if (event.httpMethod === 'GET' && id) {
      const author = authors.find((a) => String(a.id) === id);
      if (!author) return json({ error: 'Author not found' }, 404);
      return json(author);
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.log(error);
    return json({ error: error.message }, 500);
  }
};
