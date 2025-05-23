// src/services/payment.service.js
import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configuración de axios para incluir el token de autenticación
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a cada solicitud
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const PaymentService = {
  /**
   * Crea una intención de pago
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async createPaymentIntent(paymentData) {
    try {
      const response = await api.post('/payments/create-payment-intent', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear intención de pago:', error);
      throw error.response?.data || { message: 'Error al crear el pago' };
    }
  },

  /**
   * Obtiene el estado de un pago
   * @param {string} paymentId - ID del pago
   * @returns {Promise<Object>} - Estado del pago
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await api.get(`/payments/status/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estado del pago:', error);
      throw error.response?.data || { message: 'Error al obtener el estado del pago' };
    }
  },

  /**
   * Obtiene los pagos de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} type - Tipo de pagos a obtener ('all', 'tenant', 'owner')
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Desplazamiento
   * @returns {Promise<Object>} - Lista de pagos
   */
  async getUserPayments(userId, type = 'all', limit = 10, offset = 0) {
    try {
      const response = await api.get(`/payments/user/${userId}`, {
        params: { type, limit, offset },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener pagos del usuario:', error);
      throw error.response?.data || { message: 'Error al obtener los pagos' };
    }
  },

  // Create a payment preference for MercadoPago
  async createPaymentPreference(rentalData, depositAmount, description) {
    try {
      const response = await api.post('/payments/create-preference', {
        rentalData,
        amount: depositAmount,
        description,
        successUrl: `${window.location.origin}/payment/success`,
        failureUrl: `${window.location.origin}/payment/failure`,
        pendingUrl: `${window.location.origin}/payment/pending`
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment preference:', error);
      throw error;
    }
  },

  // Get payment status
  async getPaymentStatusMercadoPago(paymentId) {
    try {
      const response = await api.get(`/payments/status/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  },

  // Get user payment history
  async getUserPaymentsMercadoPago(userId, status, limit = 10, offset = 0) {
    try {
      const response = await api.get('/payments/history', {
        params: { userId, status, limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  },

  // Process payment webhook
  async processWebhook(data) {
    try {
      const response = await api.post('/payments/webhook', data);
      return response.data;
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }
};

export default PaymentService;
