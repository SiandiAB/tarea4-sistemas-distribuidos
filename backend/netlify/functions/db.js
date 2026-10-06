"use strict";

// Almacenamiento de la "base de datos" (colecciones JSON).
// Las funciones "batch" usan este modulo para aplicar los cambios
// reales una vez que el asignador de tareas lee la cola.
// (En produccion real se puede sustituir por MongoDB o SQL,
// como sugieren los tutoriales T8/T9.)
//
// Dos modos de almacenamiento:
//  - Netlify (produccion): Netlify Blobs. El sistema de archivos de
//    una funcion lambda es efimero y de solo lectura, por lo que los
//    archivos JSON no funcionan entre funciones. Blobs es durable y
//    compartido por todas las funciones del sitio.
//  - Local (dev-server.js / netlify dev): archivos JSON en data/.

const fs = require('fs');
const path = require('path');
const seed = require('./seed');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

// En produccion Netlify ejecuta las funciones en AWS Lambda, que
// establece AWS_LAMBDA_FUNCTION_NAME; netlify dev establece NETLIFY_DEV.
const USE_BLOBS =
  !!process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.NETLIFY_DEV;

// Project ID (Site ID) del sitio en Netlify.
// El token se inyecta como variable de entorno NETLIFY_BLOBS_TOKEN
// (Personal Access Token creado en Netlify), porque en algunos sitios
// la plataforma no inyecta automaticamente el contexto de Blobs.
const SITE_ID = '05a98040-a3f3-4260-a483-5ec99b6e6209';

let store = null;

function blobStore() {
  if (!store) {
    const { getStore } = require('@netlify/blobs');
    store = getStore({
      name: 'bookstore-data',
      siteID: SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN,
    });
  }
  return store;
}

function fileFor(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function clone(items) {
  return JSON.parse(JSON.stringify(items));
}

async function readCollection(name) {
  if (USE_BLOBS) {
    const raw = await blobStore().get(name);
    if (raw) return JSON.parse(raw);
    // Primera lectura en produccion: guardar los datos iniciales.
    const initial = clone(seed[name] || []);
    await blobStore().set(name, JSON.stringify(initial));
    return initial;
  }

  const file = fileFor(name);
  if (!fs.existsSync(file)) return clone(seed[name] || []);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function writeCollection(name, items) {
  if (USE_BLOBS) {
    await blobStore().set(name, JSON.stringify(items));
    return;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(fileFor(name), JSON.stringify(items, null, 2), 'utf8');
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

module.exports = { readCollection, writeCollection, nextId };
