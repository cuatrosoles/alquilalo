// src/controllers/item.controller.js
import * as itemService from "../services/item.service.js";
import { verifyToken } from "../middlewares/auth.middleware.js"; // Middleware de autenticación

const createNewItem = async (req, res) => {
  try {
    const userId = req.user.uid; // Obtenido del middleware de autenticación
    const {
      categoryId,
      title,
      description,
      pricePerDay,
      depositAmount,
      location,
      latitude,
      longitude,
      availabilityStart,
      availabilityEnd,
    } = req.body;
    const images = req.files ? await itemService.uploadImages(req.files) : []; // Subir imágenes si se proporcionan
    const item = await itemService.createItem(
      userId,
      categoryId,
      title,
      description,
      pricePerDay,
      depositAmount,
      location,
      latitude,
      longitude,
      availabilityStart,
      availabilityEnd,
      images
    );
    res.status(201).json({ message: "Artículo creado exitosamente", item });
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message || "Error al crear el artículo" });
  }
};

const getItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    console.log("Fetching item with ID:", itemId); // Add this line
    const item = await itemService.getItemById(itemId);
    console.log("Item found:", item ? "Yes" : "No"); // Add this line
    if (!item) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error in getItem controller:", error); // Add this line
    res
      .status(500)
      .json({ message: error.message || "Error al obtener el artículo" });
  }
};

const getAllItemsHandler = async (req, res) => {
  try {
    const items = await itemService.getAllItems(req.query); // Pasar los query params para los filtros
    res.json(items);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error al obtener los artículos" });
  }
};

const updateExistingItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.uid; // Obtenido del middleware de autenticación

    const existingItem = await itemService.getItemById(itemId);
    if (!existingItem || existingItem.userId !== userId) {
      return res
        .status(403)
        .json({ message: "No estás autorizado para actualizar este artículo" });
    }

    const updates = req.body;
    const updatedImages = req.files
      ? await itemService.uploadImages(req.files)
      : [];
    if (updatedImages.length > 0) {
      updates.images = [...(existingItem.images || []), ...updatedImages]; // Mantener imágenes existentes y agregar nuevas
    }

    const updatedItem = await itemService.updateItem(itemId, updates);
    res.json({
      message: "Artículo actualizado exitosamente",
      item: updatedItem,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message || "Error al actualizar el artículo" });
  }
};

const deleteExistingItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.uid; // Obtenido del middleware de autenticación

    const existingItem = await itemService.getItemById(itemId);
    if (!existingItem || existingItem.userId !== userId) {
      return res
        .status(403)
        .json({ message: "No estás autorizado para eliminar este artículo" });
    }

    await itemService.deleteItem(itemId);
    res.json({ message: `Artículo con ID ${itemId} eliminado exitosamente` });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error al eliminar el artículo" });
  }
};

const updateItemAvailability = async (itemId, status, startDate, endDate) => {
  try {
    const updates = { status };

    // If dates are provided, update availability period
    if (startDate && endDate) {
      updates.availabilityStart = startDate;
      updates.availabilityEnd = endDate;
    }

    const updatedItem = await itemService.updateItem(itemId, updates);
    return updatedItem;
  } catch (error) {
    console.error("Error updating item availability:", error);
    throw new Error("Error al actualizar la disponibilidad del artículo");
  }
};

const searchItemsHandler = async (req, res) => {
  try {
    const { search, categoryId, location } = req.query;
    console.log("Parámetros de búsqueda:", { search, categoryId, location });

    // Validar que al menos haya un criterio de búsqueda
    if (!search && !categoryId && !location) {
      return res.status(400).json({
        message:
          "Se requiere al menos un criterio de búsqueda (término, categoría o ubicación)",
      });
    }

    const items = await itemService.searchItems({
      search,
      categoryId,
      location,
    });

    console.log("Resultados de búsqueda:", items.length);

    if (items.length === 0) {
      return res.status(200).json({
        message:
          "No se encontraron artículos que coincidan con los criterios de búsqueda",
        items: [],
      });
    }

    res.json(items);
  } catch (error) {
    console.error("Error en searchItemsHandler:", error);
    res.status(500).json({
      message: error.message || "Error al buscar los artículos",
    });
  }
};

const getFeaturedItemsHandler = async (req, res) => {
  try {
    const items = await itemService.getFeaturedItems();
    res.json(items);
  } catch (error) {
    console.error("Error en getFeaturedItemsHandler:", error);
    res.status(500).json({
      message: error.message || "Error al obtener los artículos destacados",
    });
  }
};

const getRelatedItems = async (req, res) => {
  try {
    const { currentItemId, category, ownerId, limit = 4 } = req.query;

    // Obtener items relacionados por categoría y propietario
    const relatedItems = await itemService.getRelatedItems(
      currentItemId,
      category,
      ownerId,
      parseInt(limit)
    );

    res.json(relatedItems);
  } catch (error) {
    console.error("Error al obtener items relacionados:", error);
    res.status(500).json({
      message: error.message || "Error al obtener items relacionados",
    });
  }
};

export {
  createNewItem,
  getItem,
  getAllItemsHandler,
  updateExistingItem,
  deleteExistingItem,
  updateItemAvailability,
  searchItemsHandler,
  getFeaturedItemsHandler,
  getRelatedItems,
};
