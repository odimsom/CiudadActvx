// Configuración de API para la app móvil
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://ciudad-activa-server.vercel.app/api'
  : 'http://localhost:3333/api';

export { API_BASE_URL };
