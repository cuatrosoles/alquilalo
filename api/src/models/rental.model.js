const rentalSchema = {
  itemId: { type: String, required: true },
  userId: { type: String, required: true },
  ownerId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true }, // Formato HH:mm
  endTime: { type: String, required: true },   // Formato HH:mm
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    required: true 
  },
  totalPrice: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'],
    required: true 
  },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  // Campos adicionales
  notes: { type: String },
  cancellationReason: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String }
};

export default rentalSchema; 

