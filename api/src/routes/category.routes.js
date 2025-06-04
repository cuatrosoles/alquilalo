// src/routes/category.routes.js
import express from 'express';
import { createNewCategory, getCategory, getAllCategoriesHandler } from '../controllers/category.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, createNewCategory); // Requiere autenticación para crear
router.get('/:id', getCategory);
router.get('/', getAllCategoriesHandler);

// Por ahora, no incluimos PUT y DELETE

export default router;

