"use strict";

const headers = require('./headersCORS');
const { readCollection } = require('./db');

function json(data, statusCode = 200) {
  return {
    statusCode,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

function resourceId(event) {
  const parts = event.path.split('/').filter(Boolean);
  const idx = parts.indexOf('publishers');
  return parts[idx + 1] || null;
}

// Solo lectura: lista y detalle de editoriales.
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    const publishers = await readCollection('publishers');
    const id = resourceId(event);

    if (event.httpMethod === 'GET' && !id) {
      return json(publishers);
    }

    if (event.httpMethod === 'GET' && id) {
      const publisher = publishers.find((p) => String(p.id) === id);
      if (!publisher) return json({ error: 'Publisher not found' }, 404);
      return json(publisher);
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.log(error);
    return json({ error: error.message }, 500);
  }
};
