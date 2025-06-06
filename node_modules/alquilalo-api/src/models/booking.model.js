// src/models/booking.model.js
const bookingSchema = {
    itemId: String,       // ID del artículo reservado (referencia a 'items')
    borrowerId: String,   // ID del usuario que realizó la reserva (referencia a 'users')
    ownerId: String,      // ID del propietario del artículo (referencia a 'users')
    startDate: Date,
    endDate: Date,
    totalPrice: Number,
    bookingStatus: String, // 'pending', 'accepted', 'rejected', 'ongoing', 'completed', 'cancelled'
    createdAt: Date,
    updatedAt: Date,
    // Otros campos relacionados con la reserva podrían ir aquí
  };
  
  module.exports = bookingSchema;

