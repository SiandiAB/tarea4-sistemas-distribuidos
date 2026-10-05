"use strict";

// Servidor local de desarrollo que emula Netlify Functions.
// Alternativa rapida a `netlify dev`: mapea
//   /.netlify/functions/<nombre>/...  ->  netlify/functions/<nombre>.js
// Solo para pruebas locales; en produccion se usa Netlify real.

const http = require('http');
const fs = require('fs');
const path = require('path');

// Carga simple de variables desde .env si existe
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) process.env[match[1]] = match[2];
  }
}

const PORT = process.env.PORT || 8888;
const BASE = '/.netlify/functions/';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (!url.pathname.startsWith(BASE)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const rest = url.pathname.slice(BASE.length);
  const name = rest.split('/').filter(Boolean)[0];
  const fnFile = path.join(__dirname, 'netlify', 'functions', `${name}.js`);

  if (!name || !fs.existsSync(fnFile)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Function not found: ${name}` }));
    return;
  }

  const { handler } = require(fnFile);

  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', async () => {
    const event = {
      httpMethod: req.method,
      path: url.pathname,
      body: body || null,
      queryStringParameters: {},
    };
    try {
      const result = await handler(event, {});
      const statusCode = result.statusCode || 200;
      const headers = { 'Content-Type': 'application/json', ...(result.headers || {}) };
      res.writeHead(statusCode, headers);
      res.end(result.body !== undefined ? String(result.body) : '');
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Dev functions server listening on http://localhost:${PORT}`);
  console.log(`Ejemplo: http://localhost:${PORT}${BASE}books`);
});
