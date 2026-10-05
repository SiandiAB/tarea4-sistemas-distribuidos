"use strict";

const headers = require('./headersCORS');
const rabbitPromise = require('./rabbitMQ');

// Creacion diferida de un libro: envia un mensaje a la cola "bookstore".
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const book = JSON.parse(event.body);

    const channel = await rabbitPromise();
    const request = JSON.stringify({ method: 'INSERT', book });
    await channel.sendToQueue('bookstore', Buffer.from(request), { persistent: true });

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, queued: 'INSERT' }),
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
