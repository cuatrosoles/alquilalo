// src/services/item.service.js
import { db, storage } from "../config/firebase.js";
import slugify from "slugify";

const itemsCollection = db.collection("items");

const createItem = async (
  userId,
  categoryId,
  title,
  description,
  priceType,
  pricePerHour,
  pricePerDay,
  location,
  latitude,
  longitude,
  availabilityStart,
  availabilityEnd,
  images
) => {
  try {
    const slug = slugify(title, { lower: true, replacement: "-" });

    const newItem = {
      userId,
      categoryId,
      title,
      slug,
      description,
      priceType,
      pricePerHour: priceType === "hourly" ? parseFloat(pricePerHour) : null,
      pricePerDay: priceType === "daily" ? parseFloat(pricePerDay) : null,
      location,
      latitude: parseFloat(latitude) || null,
      longitude: parseFloat(longitude) || null,
      availabilityStart: availabilityStart ? new Date(availabilityStart) : null,
      availabilityEnd: availabilityEnd ? new Date(availabilityEnd) : null,
      isAvailable: true,
      images: images || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await itemsCollection.add(newItem);
    const item = await docRef.get();
    return { id: item.id, ...item.data() };
  } catch (error) {
    console.error("Error al crear el artículo:", error);
    throw error;
  }
};

const getItemById = async (itemId) => {
  try {
    const itemDoc = await itemsCollection.doc(itemId).get();
    if (!itemDoc.exists) {
      return null;
    }
    return { id: itemDoc.id, ...itemDoc.data() };
  } catch (error) {
    console.error("Error al obtener el artículo:", error);
    throw error;
  }
};

const getAllItems = async (filters = {}) => {
  try {
    let query = itemsCollection;

    // Implementar lógica de filtros aquí (por categoría, ubicación, disponibilidad, etc.)
    if (filters.categoryId) {
      query = query.where("categoryId", "==", filters.categoryId);
    }
    // ... más filtros

    const snapshot = await query.get();
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return items;
  } catch (error) {
    console.error("Error al obtener todos los artículos:", error);
    throw error;
  }
};

const updateItem = async (itemId, updates) => {
  try {
    updates.updatedAt = new Date();
    if (updates.title) {
      updates.slug = slugify(updates.title, { lower: true, replacement: "-" });
    }
    await itemsCollection.doc(itemId).update(updates);
    const updatedItemDoc = await itemsCollection.doc(itemId).get();
    return { id: updatedItemDoc.id, ...updatedItemDoc.data() };
  } catch (error) {
    console.error("Error al actualizar el artículo:", error);
    throw error;
  }
};

const deleteItem = async (itemId) => {
  try {
    await itemsCollection.doc(itemId).delete();
    return { message: `Artículo con ID ${itemId} eliminado exitosamente` };
  } catch (error) {
    console.error("Error al eliminar el artículo:", error);
    throw error;
  }
};

const uploadImages = async (files) => {
  try {
    const imageUrls = [];
    for (const file of files) {
      const storageRef = storage
        .bucket()
        .file(
          `items/<span class="math-inline">\{Date\.now\(\)\}\-</span>{file.originalname}`
        );
      await storageRef.upload(file.buffer, {
        contentType: file.mimetype,
      });
      const [url] = await storageRef.getSignedUrl({
        action: "read",
        expires: "03-09-2491", // Fecha de expiración lejana
      });
      imageUrls.push(url);
    }
    return imageUrls;
  } catch (error) {
    console.error("Error al subir imágenes:", error);
    throw error;
  }
};

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const searchItems = async (filters = {}) => {
  try {
    let query = itemsCollection;
    const snapshot = await query.get();
    let items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log("Total de items antes de filtrar:", items.length);

    // Aplicar todos los filtros
    if (filters.search) {
      const searchTerm = normalizeText(filters.search);
      console.log("Término de búsqueda normalizado:", searchTerm);

      items = items.filter((item) => {
        const titleMatch =
          item.title && normalizeText(item.title).includes(searchTerm);
        const descriptionMatch =
          item.description &&
          normalizeText(item.description).includes(searchTerm);
        const slugMatch =
          item.slug && normalizeText(item.slug).includes(searchTerm);

        if (titleMatch || descriptionMatch || slugMatch) {
          console.log("Coincidencia encontrada en item:", item.title);
          return true;
        }
        return false;
      });

      console.log("Items después de filtrar por búsqueda:", items.length);
    }

    if (filters.categoryId) {
      items = items.filter((item) => item.categoryId === filters.categoryId);
      console.log("Items después de filtrar por categoría:", items.length);
    }

    if (filters.location) {
      const locationTerm = normalizeText(filters.location);
      items = items.filter((item) => {
        const itemLocation = item.location?.address;
        if (!itemLocation) return false;

        const cityMatch =
          itemLocation.city &&
          normalizeText(itemLocation.city).includes(locationTerm);
        const provinceMatch =
          itemLocation.province &&
          normalizeText(itemLocation.province).includes(locationTerm);
        const streetMatch =
          itemLocation.street &&
          normalizeText(itemLocation.street).includes(locationTerm);

        return cityMatch || provinceMatch || streetMatch;
      });
      console.log("Items después de filtrar por ubicación:", items.length);
    }

    // Filtrar solo items disponibles
    items = items.filter((item) => item.isAvailable !== false);
    console.log("Items finales después de todos los filtros:", items.length);

    return items;
  } catch (error) {
    console.error("Error al buscar artículos:", error);
    throw error;
  }
};

const getFeaturedItems = async () => {
  try {
    const snapshot = await itemsCollection.where("featured", "==", "si").get();
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return items;
  } catch (error) {
    console.error("Error al obtener los artículos destacados:", error);
    throw error;
  }
};

export const getRelatedItems = async (
  currentItemId,
  category,
  ownerId,
  limit
) => {
  try {
    // Crear una consulta que busque items por categoría o propietario
    let query = itemsCollection
      .where("status", "==", "active")
      .limit(limit * 2);

    const snapshot = await query.get();
    const items = [];

    snapshot.forEach((doc) => {
      const item = { id: doc.id, ...doc.data() };
      // Excluir el item actual
      if (item.id === currentItemId) return;

      // Calcular un score de relevancia basado en categoría y propietario
      let score = 0;
      if (item.category === category) score += 2;
      if (item.userId === ownerId) score += 1;
      items.push({ ...item, relevanceScore: score });
    });

    // Ordenar por score de relevancia y limitar resultados
    return items
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  } catch (error) {
    console.error("Error en getRelatedItems:", error);
    throw new Error("Error al obtener items relacionados");
  }
};

export {
  createItem,
  getItemById,
  getAllItems,
  updateItem,
  deleteItem,
  uploadImages,
  searchItems,
  getFeaturedItems,
};
