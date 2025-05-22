// src/models/category.model.js
const categorySchema = {
    name: String,
    slug: String, // Para URLs amigables
    description: String,
    createdAt: Date,
    updatedAt: Date,
  };
  
  module.exports = categorySchema;

