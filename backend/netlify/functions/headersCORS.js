"use strict";

// Encabezados CORS para que el frontend (en otro origen) pueda
// consumir las funciones desde el navegador.
module.exports = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
