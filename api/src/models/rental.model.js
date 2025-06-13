const rentalSchema = {
  itemId: { type: String, required: true },
  userId: { type: String, required: true },
  ownerId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true }, // Formato HH:mm
  endTime: { type: String, required: true }, // Formato HH:mm
  status: {
    type: String,
    enum: [
      "pending_reservation", // Esperando pago de reserva
      "reserved", // Reserva pagada
      "in_progress", // Alquiler en curso
      "completed", // Alquiler completado
      "cancelled", // Cancelado
    ],
    required: true,
  },
  totalPrice: { type: Number, required: true },
  reservationAmount: { type: Number, required: true }, // Monto de la reserva
  reservationFee: { type: Number, required: true }, // Comisión del sistema (10%)
  reservationPayment: {
    status: {
      type: String,
      enum: ["pending", "completed", "refunded"],
      required: true,
    },
    method: { type: String },
    transactionId: { type: String },
    date: { type: Date },
  },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  // Campos adicionales
  notes: { type: String },
  cancellationReason: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  // Información de seguimiento
  views: { type: Number, default: 0 },
  lastViewed: { type: Date },
  // Información de usuarios
  renterInfo: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    photoURL: { type: String },
  },
  ownerInfo: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    photoURL: { type: String },
  },
  // Información del item
  itemInfo: {
    title: { type: String },
    description: { type: String },
    images: [{ type: String }],
    category: { type: String },
    priceType: { type: String, enum: ["hourly", "daily"] },
  },
  // Comunicación
  messages: [
    {
      senderId: { type: String },
      content: { type: String },
      timestamp: { type: Date },
      read: { type: Boolean, default: false },
    },
  ],
};

export default rentalSchema;
