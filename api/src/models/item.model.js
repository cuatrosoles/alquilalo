// src/models/item.model.js
const itemSchema = {
    userId: { type: String, required: true },     // ID del usuario que publicó el artículo (referencia a 'users')
    categoryId: { type: String, required: true }, // ID de la categoría del artículo (referencia a 'categories')
    title: { type: String, required: true },
    slug: String,       // Para URLs amigables
    description: { type: String, required: true },
    priceType: { type: String, enum: ['hourly', 'daily'], required: true },
    pricePerHour: { type: Number },
    pricePerDay: { type: Number, required: true },
    location: {
        address: {
            street: { type: String, required: true },
            zip: { type: String, required: true },
            city: { type: String, required: true },
            province: { type: String, required: true },
            country: { type: String, required: true }
        },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    availability: {
        days: {
            monday: {
                enabled: { type: Boolean, required: true },
                slots: [{
                    start: { type: String, required: true },
                    end: { type: String, required: true }
                }]
            },
            tuesday: {
                enabled: { type: Boolean, required: true },
                slots: [{
                    start: { type: String, required: true },
                    end: { type: String, required: true }
                }]
            },
            wednesday: {
                enabled: { type: Boolean, required: true },
                slots: [{
                    start: { type: String, required: true },
                    end: { type: String, required: true }
                }]
            },
            thursday: {
                enabled: { type: Boolean, required: true },
                slots: [{
                    start: { type: String, required: true },
                    end: { type: String, required: true }
                }]
            },
            friday: {
                enabled: { type: Boolean, required: true },
                slots: [{
                    start: { type: String, required: true },
                    end: { type: String, required: true }
                }]
            },
            saturday: {
                enabled: { type: Boolean, required: true },
                slots: [{
                    start: { type: String, required: true },
                    end: { type: String, required: true }
                }]
            },
            sunday: {
                enabled: { type: Boolean, required: true },
                slots: [{
                    start: { type: String, required: true },
                    end: { type: String, required: true }
                }]
            }
        },
        blockedDates: [{  // Nuevo campo para fechas bloqueadas
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            startTime: { type: String },  // Opcional, para alquiler por horas
            endTime: { type: String },    // Opcional, para alquiler por horas
            rentalId: { type: String, required: true }  // Referencia a la reserva que bloqueó estas fechas
        }]
    },
    images: { type: Array, required: true },      // Array de URLs de las imágenes del artículo
    mainImageIndex: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: Date,
    status: { type: String, enum: ['active', 'inactive', 'deleted'], required: true },
    // Otros campos específicos del artículo podrían ir aquí
  };
  
  module.exports = itemSchema;

