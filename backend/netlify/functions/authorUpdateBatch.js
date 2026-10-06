"use strict";

const headers = require('./headersCORS');
const { readCollection, writeCollection } = require('./db');

// Aplica la actualizacion real de un autor sobre la base de datos.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const id = parseInt(event.path.split('/').pop(), 10);
    const data = JSON.parse(event.body);
    const authors = await readCollection('authors');
    const index = authors.findIndex((a) => Number(a.id) === id);

    if (index === -1) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Author not found' }) };
    }

    authors[index] = { ...authors[index], ...data, id: authors[index].id };
    await writeCollection('authors', authors);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(authors[index]),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify({ error: error.message }) };
  }
};
