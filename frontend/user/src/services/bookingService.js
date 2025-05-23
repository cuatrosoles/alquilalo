import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const bookingService = {
  // Crear una nueva reserva
  createBooking: async (itemId, startDate, endDate) => {
    try {
      const response = await axios.post(`${API_URL}/bookings`, {
        itemId,
        startDate,
        endDate
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener una reserva específica
  getBooking: async (bookingId) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener todas las reservas del usuario
  getUserBookings: async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/user`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar el estado de una reserva
  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await axios.patch(`${API_URL}/bookings/${bookingId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default bookingService; 