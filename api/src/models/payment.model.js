// src/models/payment.model.js
const paymentSchema = {
  rentalId: { type: String, required: true },     // ID de la reserva asociada
  userId: { type: String, required: true },      // ID del usuario que realiza el pago
  ownerId: { type: String, required: true },     // ID del propietario que recibe el pago
  amount: { type: Number, required: true },      // Monto total del pago
  fee: { type: Number, required: true },         // Comisión de la plataforma
  ownerAmount: { type: Number, required: true }, // Monto que recibe el propietario (amount - fee)
  paymentMethod: { type: String, required: true }, // 'mercadopago', 'transfer', etc.
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'in_process', 'rejected', 'refunded', 'cancelled'],
    required: true 
  },
  mercadoPagoId: String,      // ID de pago en MercadoPago
  mercadoPagoStatus: String,  // Estado en MercadoPago
  mercadoPagoDetail: String,  // Detalle adicional de MercadoPago
  receiptUrl: String,         // URL del comprobante de pago
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = paymentSchema;
