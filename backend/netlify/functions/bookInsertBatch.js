"use strict";

const headers = require('./headersCORS');
const { readCollection, writeCollection, nextId } = require('./db');

// Aplica la creacion real de un libro sobre la base de datos.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const data = JSON.parse(event.body);
    const books = readCollection('books');

    const newBook = { ...data, id: nextId(books) };
    books.push(newBook);
    writeCollection('books', books);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify({ error: error.message }) };
  }
};
