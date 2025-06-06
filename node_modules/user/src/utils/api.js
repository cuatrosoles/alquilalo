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

// Cache para el token
let tokenRefreshPromise = null;

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(async (config) => {
  // No intentar autenticar si la URL es de autenticación
  if (config.url.includes('/auth/') || !auth.currentUser) {
    return config;
  }

  try {
    const now = Date.now();
    const tokenExpiration = tokenCache?.expiresAt || 0;
    const tokenNeedsRefresh = !tokenCache?.value || now >= tokenExpiration - 300000; // 5 minutos de margen

    if (tokenNeedsRefresh) {
      // Si ya hay un refresh en curso, esperar a que termine
      if (!tokenRefreshPromise) {
        tokenRefreshPromise = auth.currentUser.getIdToken(true)
          .then(token => {
            if (token) {
              tokenCache = {
                value: token,
                expiresAt: Date.now() + 3600000 // 1 hora de validez
              };
            }
            return token;
          })
          .finally(() => {
            tokenRefreshPromise = null;
          });
      }

      try {
        const token = await tokenRefreshPromise;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error al refrescar el token:', error);
        // Si hay un token en caché, usarlo aunque esté por expirar
        if (tokenCache?.value) {
          config.headers.Authorization = `Bearer ${tokenCache.value}`;
        }
      }
    } else if (tokenCache?.value) {
      // Usar el token en caché si aún es válido
      config.headers.Authorization = `Bearer ${tokenCache.value}`;
    }

    return config;
  } catch (error) {
    console.error('Error en el interceptor de autenticación:', error);
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