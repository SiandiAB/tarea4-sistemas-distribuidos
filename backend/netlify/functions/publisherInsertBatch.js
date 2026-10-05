"use strict";

const headers = require('./headersCORS');
const { readCollection, writeCollection, nextId } = require('./db');

// Aplica la creacion real de una editorial sobre la base de datos.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const data = JSON.parse(event.body);
    const publishers = readCollection('publishers');

    const newPublisher = { ...data, id: nextId(publishers), books: [] };
    publishers.push(newPublisher);
    writeCollection('publishers', publishers);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(newPublisher),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify({ error: error.message }) };
  }
};
