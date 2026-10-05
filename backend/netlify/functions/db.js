"use strict";

// Almacenamiento simple en archivos JSON dentro de data/.
// Las funciones "batch" usan este modulo para aplicar los cambios
// reales una vez que el asignador de tareas lee la cola.
// (En produccion real se puede sustituir por MongoDB o SQL,
// como sugieren los tutoriales T8/T9.)

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

function fileFor(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readCollection(name) {
  const file = fileFor(name);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

function writeCollection(name, items) {
  const file = fileFor(name);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(items, null, 2), 'utf8');
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

module.exports = { readCollection, writeCollection, nextId };
