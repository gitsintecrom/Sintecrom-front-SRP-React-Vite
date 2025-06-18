// src/api/axiosInstance.js

import axios from 'axios';

// 1. Leer la URL base de las variables de entorno
const baseURL = import.meta.env.VITE_API_BASE_URL;

// 2. Crear una instancia de Axios con la configuración base
const axiosInstance = axios.create({
  baseURL: baseURL,
});

// 3. (Opcional pero muy recomendado) Añadir un interceptor para el token de autenticación
axiosInstance.interceptors.request.use(
  (config) => {
    // Obtener el token de localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Si el token existe, añadirlo a la cabecera 'Authorization'
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Manejar errores de la petición
    return Promise.reject(error);
  }
);

// 4. Exportar la instancia configurada
export default axiosInstance;