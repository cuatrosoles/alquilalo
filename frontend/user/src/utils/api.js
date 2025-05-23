// frontend/user/src/utils/api.js
import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(async (config) => {
  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken(true); // Forzar refresco del token
      if (!token) {
        throw new Error('No se pudo obtener el token');
      }
      config.headers.Authorization = `Bearer ${token}`;
      ///console.log('Token agregado a la petición:', token);
    } else {
      console.warn('No hay usuario autenticado');
    }
    return config;
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return Promise.reject(error);
  }
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Intentar refrescar el token
        if (auth.currentUser) {
          const newToken = await auth.currentUser.getIdToken(true);
          if (newToken) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return api(error.config);
          }
        }
        // Si no se pudo refrescar el token, redirigir al login
        window.location.href = '/login';
      } catch (refreshError) {
        console.error('Error al refrescar el token:', refreshError);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;