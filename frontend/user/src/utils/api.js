// frontend/user/src/utils/api.js
import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cache para el token y su tiempo de expiración
let tokenCache = {
  value: null,
  expiresAt: 0
};

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(async (config) => {
  // No intentar autenticar si la URL es de autenticación
  if (config.url.includes('/auth/')) {
    return config;
  }

  try {
    if (auth.currentUser) {
      const now = Date.now();
      // Solo refrescar el token si ha caducado o está a punto de caducar (en los próximos 5 minutos)
      if (!tokenCache.value || now >= tokenCache.expiresAt - 300000) {
        try {
          const token = await auth.currentUser.getIdToken(true);
          if (token) {
            tokenCache = {
              value: token,
              // El token de Firebase expira después de 1 hora (3600 segundos)
              expiresAt: now + 3600000
            };
          }
        } catch (tokenError) {
          console.error('Error al refrescar el token:', tokenError);
          // No romper el flujo si falla el refresco del token
          if (tokenCache.value) {
            // Usar el token en caché si está disponible
            config.headers.Authorization = `Bearer ${tokenCache.value}`;
            return config;
          }
          throw tokenError;
        }
      }
      
      if (tokenCache.value) {
        config.headers.Authorization = `Bearer ${tokenCache.value}`;
      } else {
        console.warn('No se pudo obtener el token de autenticación');
      }
    } else {
      console.warn('No hay usuario autenticado');
    }
    return config;
  } catch (error) {
    console.error('Error en el interceptor de autenticación:', error);
    // No rechazar la promesa para permitir que las peticiones sin autenticación continúen
    return config;
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