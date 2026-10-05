"use strict";

const headers = require('./headersCORS');
const { readCollection, writeCollection } = require('./db');

// Aplica la actualizacion real de un libro sobre la base de datos.
// Corresponde a la funcion bookUpdate del tutorial anterior (T6),
// renombrada a bookUpdateBatch.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const id = parseInt(event.path.split('/').pop(), 10);
    const data = JSON.parse(event.body);
    const books = readCollection('books');
    const index = books.findIndex((b) => Number(b.id) === id);

    if (index === -1) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Book not found' }) };
    }

    books[index] = { ...books[index], ...data, id: books[index].id };
    writeCollection('books', books);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(books[index]),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify({ error: error.message }) };
  }
};
