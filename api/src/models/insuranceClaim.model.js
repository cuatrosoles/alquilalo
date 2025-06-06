// src/models/insuranceClaim.model.js
const insuranceClaimSchema = {
    bookingId: String,    // ID de la reserva asociada (referencia a 'bookings')
    claimantId: String,   // ID del usuario que presenta la reclamación (referencia a 'users')
    reason: String,       // Motivo de la reclamación
    description: String,  // Descripción detallada de la reclamación
    status: String,       // 'pending', 'reviewing', 'approved', 'rejected'
    createdAt: Date,
    updatedAt: Date,
    // Podrían incluirse campos para evidencia (imágenes, documentos, etc.)
  };
  
  module.exports = insuranceClaimSchema;

