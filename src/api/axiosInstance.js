// // // /src/api/axiosInstance.js

import axios from 'axios';
import Swal from 'sweetalert2'; 

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const isLocalAuthErrorHandling = error.config && error.config.localAuthErrorHandling;

            if ((error.response.status === 401 || error.response.status === 403) && !isLocalAuthErrorHandling) {
                console.error("Error de autenticación global detectado. Cerrando sesión.");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                Swal.fire({
                    title: 'Sesión Expirada',
                    text: 'Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión nuevamente.',
                    icon: 'warning',
                    confirmButtonText: 'Ok'
                }).then(() => {
                    window.location.href = '/login'; 
                });
                
                return new Promise(() => {}); // Detiene el flujo
            }
        }
        return Promise.reject(error); // Permite que el manejo local continúe si localAuthErrorHandling es true
    }
);

export default axiosInstance;