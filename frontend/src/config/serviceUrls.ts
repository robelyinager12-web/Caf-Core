export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD
    ? 'https://caf-core.onrender.com/api'
    : 'http://localhost:5000/api');

export const API_ORIGIN =
  import.meta.env.VITE_SOCKET_URL ??
  API_BASE_URL.replace(/\/api\/?$/, '');
