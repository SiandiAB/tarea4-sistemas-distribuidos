"use strict";

// Conexion con el broker de mensajes (CloudAMQP).
// La variable de ambiente CLOUDAMQP_URL debe contener el "AMQP URL"
// que muestra CloudAMQP al crear la instancia (plan gratuito "Little Lemur").
//
// Transporte (variable RABBIT_TRANSPORT):
//   "amqp" (por defecto) -> protocolo AMQP 0-9-1 con amqplib (puerto 5671),
//                           como en los tutoriales T8/T9.
//   "http"                -> API HTTP de gestion de RabbitMQ (puerto 443),
//                           util cuando la red bloquea los puertos AMQP.
// Ambos usan la misma cola "bookstore", por lo que el patron de la tarea
// (mensaje a la cola + asignador de tareas) funciona identico.

function parseCredentials() {
  const url = new URL(process.env.CLOUDAMQP_URL);
  return {
    host: url.hostname,
    user: decodeURIComponent(url.username),
    pass: decodeURIComponent(url.password),
    vhost: url.pathname.replace(/^\//, '') || '%2f',
  };
}

// Canal AMQP (amqplib): como en el tutorial.
async function channelAmqp() {
  const amqp = require('amqplib');
  const conn = await amqp.connect(process.env.CLOUDAMQP_URL);
  const channel = await conn.createChannel();
  // Garantiza que la cola "bookstore" exista en el broker
  // (tambien puede crearse manualmente desde el Rabbit Manager).
  await channel.assertQueue('bookstore', { durable: true });
  return channel;
}

// Canal HTTP (Management API sobre 443): mismo contrato que el canal AMQP
// para las operaciones que usan las funciones (sendToQueue y get).
async function channelHttp() {
  const { host, user, pass, vhost } = parseCredentials();
  const auth = Buffer.from(`${user}:${pass}`).toString('base64');
  const base = `https://${host}/api`;

  async function publish(queue, content) {
    const res = await fetch(
      `${base}/exchanges/${encodeURIComponent(vhost)}/amq.default/publish`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { delivery_mode: 2 },
          routing_key: queue,
          payload: content.toString('utf8'),
          payload_encoding: 'string',
        }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`HTTP publish ${res.status}: ${JSON.stringify(data)}`);
    }
    return data;
  }

  async function getMessage(queue) {
    const res = await fetch(
      `${base}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(queue)}/get`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        // ackmode "ack_requeue_false" = el mensaje se elimina de la cola al
        // leerlo (equivalente a channel.get con noAck, como en bookTasks).
        body: JSON.stringify({ count: 1, ackmode: 'ack_requeue_false', encoding: 'auto' }),
      }
    );
    const data = await res.json().catch(() => []);
    const arr = Array.isArray(data) ? data : [];
    if (arr.length === 0) return null;
    return { content: Buffer.from(arr[0].payload, 'utf8') };
  }

  return {
    sendToQueue: async (queue, content) => {
      await publish(queue, content);
    },
    get: async (queue) => getMessage(queue),
    assertQueue: async () => {
      /* la cola ya fue creada desde el Rabbit Manager */
    },
  };
}

module.exports = async () => {
  const transport = (process.env.RABBIT_TRANSPORT || 'amqp').toLowerCase();
  if (transport === 'http') {
    return channelHttp();
  }
  return channelAmqp();
};
