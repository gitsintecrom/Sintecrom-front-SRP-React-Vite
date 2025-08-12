// // src/api/axiosInstance.js

// import axios from 'axios';

// // 1. Leer la URL base de las variables de entorno
// const baseURL = import.meta.env.VITE_API_BASE_URL;

// // 2. Crear una instancia de Axios con la configuración base
// const axiosInstance = axios.create({
//   baseURL: baseURL,
// });

// // 3. (Opcional pero muy recomendado) Añadir un interceptor para el token de autenticación
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Obtener el token de localStorage
//     const token = localStorage.getItem('token');
//     if (token) {
//       // Si el token existe, añadirlo a la cabecera 'Authorization'
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     // Manejar errores de la petición
//     return Promise.reject(error);
//   }
// );

// // 4. Exportar la instancia configurada
// export default axiosInstance;




// /src/api/axiosInstance.js

import axios from 'axios';

// Crea la instancia de Axios
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Asegúrate de que esta variable esté en tu .env
});

// 1. Interceptor para AÑADIR el token a CADA petición
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // O donde sea que lo guardes
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. Interceptor para MANEJAR los errores de respuesta globalmente
axiosInstance.interceptors.response.use(
    (response) => {
        // Si la respuesta es exitosa (código 2xx), simplemente la devuelve
        return response;
    },
    (error) => {
        // Si la respuesta es un error...
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Si el error es 401 (No autorizado) o 403 (Prohibido)
            console.error("Error de autenticación detectado. Cerrando sesión.");
            
            // Limpia el almacenamiento local
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirige a la página de login
            // Usamos window.location en lugar de useNavigate porque estamos fuera de un componente React
            window.location.href = '/login'; 
            
            // Opcional: podrías mostrar una alerta antes de redirigir
            // alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        }

        // Para cualquier otro error, simplemente lo rechaza para que pueda ser manejado
        // por el bloque .catch() de la llamada original (como en tus componentes).
        return Promise.reject(error);
    }
);

export default axiosInstance;