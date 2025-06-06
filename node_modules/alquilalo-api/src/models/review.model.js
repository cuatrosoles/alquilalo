// src/models/review.model.js
const reviewSchema = {
    itemId: String,     // ID del artículo valorado (referencia a 'items')
    userId: String,     // ID del usuario que dejó la valoración (referencia a 'users')
    rating: Number,     // Puntuación (ej. 1 a 5)
    comment: String,    // Comentario opcional
    createdAt: Date,
    updatedAt: Date,
  };
  
  module.exports = reviewSchema;

