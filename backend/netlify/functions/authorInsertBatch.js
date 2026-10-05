"use strict";

const headers = require('./headersCORS');
const { readCollection, writeCollection, nextId } = require('./db');

// Aplica la creacion real de un autor sobre la base de datos.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const data = JSON.parse(event.body);
    const authors = readCollection('authors');

    const newAuthor = { ...data, id: nextId(authors), books: [] };
    authors.push(newAuthor);
    writeCollection('authors', authors);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(newAuthor),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify({ error: error.message }) };
  }
};
