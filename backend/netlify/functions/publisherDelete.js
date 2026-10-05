"use strict";

const headers = require('./headersCORS');
const rabbitPromise = require('./rabbitMQ');

// Eliminacion diferida de una editorial: solo viaja el id en el mensaje.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const id = parseInt(event.path.split('/').pop(), 10);

    const channel = await rabbitPromise();
    const request = JSON.stringify({ method: 'DELETE', id });
    await channel.sendToQueue('bookstore', Buffer.from(request), { persistent: true });

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, queued: 'DELETE', id }),
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
