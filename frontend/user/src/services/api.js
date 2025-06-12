import axios from "axios";
// He renombrado la importación de 'api' a 'axiosInstance' para evitar confusión
// y lo he movido aquí para centralizar toda la lógica de API.
import { auth } from "../config/firebase"; // Asegúrate que la ruta a tu config de firebase sea correcta

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api", // Es buena práctica tener un prefijo /api
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Interceptores de Axios para la autenticación (Tu código existente) ---
axiosInstance.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Error obteniendo el token de autenticación", error);
    }
  }
  return config;
});

// Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en km
};

export const searchItems = async (filters) => {
  try {
    // Construir los parámetros de búsqueda
    const searchParams = new URLSearchParams();

    if (filters.search) {
      // Normalizar el término de búsqueda antes de enviarlo
      const searchTerm = filters.search
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
      searchParams.append("search", searchTerm);
    }
    if (filters.categoryId) {
      searchParams.append("categoryId", filters.categoryId);
    }
    if (filters.location) {
      searchParams.append("location", filters.location);
    }

    console.log("Enviando búsqueda con parámetros:", searchParams.toString());

    const response = await axiosInstance.get(
      `/items/search?${searchParams.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error en la búsqueda:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Error al realizar la búsqueda"
    );
  }
};

export const getCategories = async () => {
  try {
    const response = await axiosInstance.get("/categories");
    ///console.log("Respuesta de categorías:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener categorías:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Error al obtener las categorías"
    );
  }
};

export const getFeaturedItems = async () => {
  try {
    const response = await axiosInstance.get("/items/featured");
    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener artículos destacados:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Error al obtener los artículos destacados"
    );
  }
};

/**
 * Obtiene TODOS los artículos disponibles.
 * @returns {Promise<Array>} - Una promesa que resuelve a un array con todos los items.
 */
export const getAllItems = async () => {
  try {
    // Este endpoint '/items' debería devolver todos los artículos.
    // Asegúrate de que tu backend tenga esta ruta configurada.
    const response = await axiosInstance.get("/items");
    return response.data;
  } catch (error) {
    console.error("Error al obtener todos los artículos:", error);
    throw error;
  }
};

export default axiosInstance;
