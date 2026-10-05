"use strict";

const rabbitPromise = require('./rabbitMQ');
const headers = require('./headersCORS');

const url = (process.env.APP_URL || 'http://localhost:8888') + '/.netlify/functions/';

// Asignador de tareas de editoriales (equivalente a bookTasks):
// lee los mensajes de la cola "bookstore" e invoca las funciones batch
// de editoriales segun el metodo de cada mensaje.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const channel = await rabbitPromise();
    let message = await channel.get('bookstore', { noAck: true });
    let processed = 0;

    while (message) {
      const request = JSON.parse(message.content.toString());
      switch (request.method) {
        case 'DELETE':
          await fetch(url + 'publisherDeleteBatch/' + request.id, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
          break;
        case 'UPDATE':
          await fetch(url + 'publisherUpdateBatch/' + request.id, {
            headers: { 'Content-Type': 'application/json' },
            method: 'PUT',
            body: JSON.stringify(request.publisher),
          });
          break;
        case 'INSERT':
          await fetch(url + 'publisherInsertBatch', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(request.publisher),
          });
          break;
      }
      processed++;
      message = await channel.get('bookstore', { noAck: true });
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, processed }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 422,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
