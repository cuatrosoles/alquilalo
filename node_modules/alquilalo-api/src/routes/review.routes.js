// src/routes/review.routes.js
import express from 'express';
import { createNewReview, getItemReviews } from '../controllers/review.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, createNewReview); // Crear una nueva valoración (requiere autenticación)
router.get('/item/:itemId', getItemReviews);   // Obtener valoraciones de un artículo (no requiere autenticación)

export default router;

