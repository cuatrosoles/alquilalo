// src/controllers/category.controller.js
import * as categoryService from "../services/category.service.js";
import { verifyToken } from "../middlewares/auth.middleware.js"; // Middleware de autenticación (para crear categorías)

const createNewCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await categoryService.createCategory(name, description);
    res.status(201).json({ message: 'Categoría creada exitosamente', category });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error al crear la categoría' });
  }
};

const getCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryService.getCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error al obtener la categoría' });
  }
};

const getAllCategoriesHandler = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error al obtener las categorías' });
  }
};

export { createNewCategory, getCategory, getAllCategoriesHandler };
