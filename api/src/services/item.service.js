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

const searchItems = async (filters = {}) => {
  try {
    let query = itemsCollection;

    // Filtrar por término de búsqueda (título o descripción)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const snapshot = await query.get();
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por categoría
    if (filters.categoryId) {
      query = query.where("categoryId", "==", filters.categoryId);
    }

    // Filtrar por ubicación
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      const snapshot = await query.get();
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return items.filter((item) => {
        const itemLocation = item.location?.address;
        if (!itemLocation) return false;

        return (
          itemLocation.city?.toLowerCase().includes(locationTerm) ||
          itemLocation.province?.toLowerCase().includes(locationTerm) ||
          itemLocation.street?.toLowerCase().includes(locationTerm)
        );
      });
    }

    // Si no hay filtros, devolver todos los items
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al buscar artículos:", error);
    throw error;
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
};
