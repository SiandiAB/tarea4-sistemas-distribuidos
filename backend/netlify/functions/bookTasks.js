"use strict";

const rabbitPromise = require('./rabbitMQ');
const headers = require('./headersCORS');

// Direccion base del propio sitio. APP_URL debe apuntar al dominio
// de Netlify en produccion (ej. https://bookstore-rabbitmq.netlify.app)
// o a http://localhost:8888 en desarrollo (netlify dev).
const url = (process.env.APP_URL || 'http://localhost:8888') + '/.netlify/functions/';

// Asignador de tareas: lee todos los mensajes pendientes de la cola
// "bookstore", los analiza y, segun el metodo, invoca la funcion batch
// correspondiente que realiza el cambio real en la base de datos.
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
          await fetch(url + 'bookDeleteBatch/' + request.id, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
          break;
        case 'UPDATE':
          await fetch(url + 'bookUpdateBatch/' + request.id, {
            headers: { 'Content-Type': 'application/json' },
            method: 'PUT',
            body: JSON.stringify(request.book),
          });
          break;
        case 'INSERT':
          await fetch(url + 'bookInsertBatch', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(request.book),
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
