// Direccion del backend (funciones de Netlify).
// En desarrollo: http://localhost:8888 (netlify dev).
// Para produccion, compilar con la variable de entorno:
//   VITE_BACKEND_URL=https://<tu-sitio>.netlify.app npm run build
export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8888';

// Todas las funciones de Netlify viven bajo /.netlify/functions/
export const functionsUrl = `${backendUrl}/.netlify/functions`;
