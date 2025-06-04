// src/models/message.model.js
const messageSchema = {
    bookingId: String,    // ID de la reserva asociada (referencia a 'bookings')
    senderId: String,     // ID del usuario que envió el mensaje (referencia a 'users')
    receiverId: String,   // ID del usuario que recibió el mensaje (referencia a 'users')
    content: String,
    createdAt: Date,
    readAt: Date,         // Fecha en que el receptor leyó el mensaje
    updatedAt: Date,
  };
  
  module.exports = messageSchema;

