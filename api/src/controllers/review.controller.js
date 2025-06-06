// src/controllers/review.controller.js
import * as reviewService from "../services/review.service.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const createNewReview = async (req, res) => {
  try {
    const { itemId, rating, comment } = req.body;
    const userId = req.user.uid;
    const review = await reviewService.createReview(itemId, userId, rating, comment);
    res.status(201).json({ message: 'Valoración creada exitosamente', review });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error al crear la valoración' });
  }
};

const getItemReviews = async (req, res) => {
  try {
    const { itemId } = req.params;
    const reviews = await reviewService.getReviewsByItemId(itemId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error al obtener las valoraciones del artículo' });
  }
};

export { createNewReview, getItemReviews };
