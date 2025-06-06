// src/services/mercadoPago.service.js
import { MercadoPagoConfig, Preference } from 'mercadopago';
import config from '../config/config.js';

// Create a new client instance
const client = new MercadoPagoConfig({
  accessToken: config.mercadoPago.accessToken,
  options: { 
    clientId: config.mercadoPago.publicKey,
    timeout: 5000,
  }
});

class MercadoPagoService {
  /**
   * Crea una preferencia de pago en MercadoPago
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} - Respuesta de MercadoPago
   */
  static async createPayment(paymentData) {
    const { title, description, amount, quantity, payer, notification_url, external_reference } = paymentData;
    
    try {
      const preference = new Preference(client);
      
      const response = await preference.create({
        body: {
          items: [
            {
              title,
              description,
              quantity: quantity || 1,
              currency_id: 'ARS',
              unit_price: parseFloat(amount)
            }
          ],
          payer: {
            email: payer?.email || '',
            name: payer?.name || '',
            surname: payer?.surname || ''
          },
          notification_url,
          external_reference,
          back_urls: {
            success: `${config.frontendUrl}/payment/success`,
            failure: `${config.frontendUrl}/payment/failure`,
            pending: `${config.frontendUrl}/payment/pending`
          },
          auto_return: 'approved'
        }
      });

      return response;
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error);
      throw new Error(error.message || 'Error al crear la preferencia de pago');
    }
  }

  /**
   * Obtiene información de un pago
   * @param {string} paymentId - ID del pago en MercadoPago
   * @returns {Promise<Object>} - Información del pago
   */
  static async getPayment(paymentId) {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${client.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener el pago de MercadoPago');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }

  /**
   * Procesa una notificación de webhook
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object>} - Datos del pago
   */
  static async processWebhook(id) {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${client.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al procesar la notificación de MercadoPago');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }
}

export default MercadoPagoService;
