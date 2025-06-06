// src/services/category.service.js
import { db } from '../config/firebase.js';
import slugify from 'slugify';

const categoriesCollection = db.collection('categories');

const createCategory = async (name, description = '') => {
  try {
    const slug = slugify(name, { lower: true, replacement: '-' });
    const newCategory = {
      name,
      slug,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await categoriesCollection.add(newCategory);
    const category = await docRef.get();
    return { id: category.id, ...category.data() };
  } catch (error) {
    console.error('Error al crear la categoría:', error);
    throw error;
  }
};

const getCategoryById = async (categoryId) => {
  try {
    const categoryDoc = await categoriesCollection.doc(categoryId).get();
    if (!categoryDoc.exists) {
      return null;
    }
    return { id: categoryDoc.id, ...categoryDoc.data() };
  } catch (error) {
    console.error('Error al obtener la categoría:', error);
    throw error;
  }
};

const getAllCategories = async () => {
  try {
    const snapshot = await categoriesCollection.get();
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return categories;
  } catch (error) {
    console.error('Error al obtener todas las categorías:', error);
    throw error;
  }
};

// Por ahora, no incluimos update y delete para simplificar

export { createCategory, getCategoryById, getAllCategories };

export default { createCategory, getCategoryById, getAllCategories };