"use strict";

const headers = require('./headersCORS');
const { readCollection, writeCollection } = require('./db');

// Aplica la actualizacion real de una editorial sobre la base de datos.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const id = parseInt(event.path.split('/').pop(), 10);
    const data = JSON.parse(event.body);
    const publishers = readCollection('publishers');
    const index = publishers.findIndex((p) => Number(p.id) === id);

    if (index === -1) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Publisher not found' }) };
    }

    publishers[index] = { ...publishers[index], ...data, id: publishers[index].id };
    writeCollection('publishers', publishers);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(publishers[index]),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify({ error: error.message }) };
  }
};
