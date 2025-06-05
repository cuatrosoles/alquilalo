import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://alquilalo.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const searchItems = async (filters) => {
  try {
    const response = await api.get("/items", { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    console.log("Respuesta de categorías:", response.data);
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
    const response = await api.get("/items", { params: { featured: true } });
    console.log("Respuesta de items destacados:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener items destacados:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Error al obtener los items destacados"
    );
  }
};

export default api;
