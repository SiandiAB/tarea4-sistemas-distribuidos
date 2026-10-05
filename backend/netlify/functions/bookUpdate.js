"use strict";

const headers = require('./headersCORS');
const rabbitPromise = require('./rabbitMQ');

// Actualizacion diferida de un libro: en lugar de escribir la base de datos,
// se envia un mensaje a la cola "bookstore" con la informacion necesaria.
// El mensaje se construye con JSON.stringify para que sea un JSON valido
// (comillas dobles) y bookTasks pueda reconstruirlo con JSON.parse.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const id = parseInt(event.path.split('/').pop(), 10);
    const book = JSON.parse(event.body);

    const channel = await rabbitPromise();
    const request = JSON.stringify({ method: 'UPDATE', id, book });
    await channel.sendToQueue('bookstore', Buffer.from(request), { persistent: true });

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, queued: 'UPDATE', id }),
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
