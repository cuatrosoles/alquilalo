// src/controllers/payment.controller.js
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';
import { admin } from '../config/firebase.js';
import Rental from '../models/rental.model.js'; 
import { updateItemAvailability } from './item.controller.js';

// Configure MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    integratorId: process.env.MERCADOPAGO_INTEGRATOR_ID,
  },
});

class PaymentController {
  constructor() {
    // Initialize MercadoPago clients
    this.preference = new Preference(client);
    this.payment = new Payment(client);
    
    // Initialize Firestore
    this.db = admin.firestore();
    
    // Bind all methods to maintain 'this' context
    this.createPaymentPreference = this.createPaymentPreference.bind(this);
    this.handleWebhook = this.handleWebhook.bind(this);
    this.getPaymentStatus = this.getPaymentStatus.bind(this);
    this.getPaymentHistory = this.getPaymentHistory.bind(this);
  }

  // Create a payment preference
  async createPaymentPreference(req, res) {
    try {
      const { rentalData, amount, description } = req.body;
      
      console.log('Received payment preference request with data:', {
        rentalData,
        amount,
        description,
        user: req.user?.email
      });
      
      // Ensure we have a valid amount
      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        throw new Error('Monto de pago inválido');
      }

      // Create base URL for callbacks
      const baseUrl = 'https://alquilalo.juanprogramador.com';
      
      // Create a preference
      const preferenceData = {
        items: [
          {
            id: rentalData?.rentalId || uuidv4(),
            title: description?.substring(0, 255) || 'Depósito de garantía',
            quantity: 1,
            currency_id: 'ARS',
            unit_price: paymentAmount,
            description: `Depósito de garantía para ${description?.substring(0, 500) || 'reserva'}`,
          },
        ],
        payer: {
          name: req.user?.name || 'Cliente',
          email: req.user?.email || 'cliente@example.com',
        },
        external_reference: JSON.stringify({
          rentalId: rentalData?.rentalId,
          userId: req.user?.id,
          type: 'deposit',
        }),
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 3,
        },
        back_urls: {
          success: `${baseUrl}/payment/success`,
          failure: `${baseUrl}/payment/failure`,
          pending: `${baseUrl}/payment/pending`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/payments/webhook`,
        statement_descriptor: 'ALQUILALO',
      };

      console.log('Sending to MercadoPago:', JSON.stringify(preferenceData, null, 2));
      
      const response = await this.preference.create({ body: preferenceData });
      console.log('MercadoPago response:', JSON.stringify(response, null, 2));
      
      // Update rental with payment preference ID in Firestore
      if (rentalData?.rentalId) {
        const preferenceId = response.id;
        if (!preferenceId) {
          throw new Error('No se pudo obtener el ID de preferencia de MercadoPago');
        }
        
        await this.db.collection('rentals').doc(rentalData.rentalId).update({
          paymentPreferenceId: preferenceId,
          paymentStatus: 'pending',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Return the init_point for redirecting to MercadoPago
      res.json({
        id: response.id,
        init_point: response.sandbox_init_point, // Use sandbox for testing
        status: 'pending',
        preference: response
      });
    } catch (error) {
      console.error('Error creating payment preference:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({ 
        message: 'Error al crear la preferencia de pago',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : {}
      });
    }
  }

  // Handle payment webhook
  async handleWebhook(req, res) {
    try {
      const { type, data } = req.body;
      
      if (type === 'payment') {
        const paymentResponse = await this.payment.findById(data.id);
        const { external_reference } = paymentResponse.body;
        const { rentalId } = JSON.parse(external_reference);
        
        // Update rental status based on payment status
        const statusMap = {
          'approved': 'confirmed',
          'rejected': 'cancelled',
          'in_process': 'pending',
          'pending': 'pending',
          'authorized': 'confirmed',
          'cancelled': 'cancelled',
          'refunded': 'refunded',
          'charged_back': 'refunded',
          'in_mediation': 'disputed',
        };
        
        const paymentStatus = paymentResponse.body.status;
        const newStatus = statusMap[paymentStatus] || 'pending';
        
        // Update rental status
        await this.db.collection('rentals').doc(rentalId).update({
          status: newStatus,
          paymentStatus: paymentStatus,
          paymentDetails: paymentResponse.body,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Update item availability if payment is approved
        if (paymentStatus === 'approved') {
          const rentalDoc = await this.db.collection('rentals').doc(rentalId).get();
          const rentalData = rentalDoc.data();
          await updateItemAvailability(
            rentalData.itemId,
            'reserved',
            rentalData.startDate,
            rentalData.endDate
          );
        }
        
        console.log(`Payment ${paymentStatus} for rental ${rentalId}`);
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ 
        message: 'Error al procesar el webhook',
        error: error.message 
      });
    }
  }
  
  // Get payment status
  async getPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      const paymentResponse = await this.payment.findById(paymentId);
      
      if (!paymentResponse) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      res.json({
        id: paymentResponse.body.id,
        status: paymentResponse.body.status,
        statusDetail: paymentResponse.body.status_detail,
        amount: paymentResponse.body.transaction_amount,
        paymentMethod: paymentResponse.body.payment_type_id,
        dateApproved: paymentResponse.body.date_approved,
        paymentDetails: paymentResponse.body,
      });
    } catch (error) {
      console.error('Error getting payment status:', error);
      res.status(500).json({ 
        message: 'Error al obtener el estado del pago',
        error: error.message 
      });
    }
  }
  
  // Get payment history for a user
  async getPaymentHistory(req, res) {
    try {
      const { userId, status, limit = 10, offset = 0 } = req.query;
      
      const query = { 'paymentHistory.0': { $exists: true } };
      if (userId) query.userId = userId;
      if (status) query['paymentHistory.status'] = status;
      
      const rentals = await Rental.find(query)
        .sort({ 'paymentHistory.date': -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .populate('itemId', 'title images');
      
      // Flatten payment history
      const payments = [];
      rentals.forEach(rental => {
        rental.paymentHistory.forEach(payment => {
          payments.push({
            id: payment._id,
            rentalId: rental._id,
            item: {
              id: rental.itemId?._id,
              title: rental.itemId?.title,
              image: rental.itemId?.images?.[0],
            },
            type: payment.type,
            amount: payment.amount,
            status: payment.status,
            date: payment.date,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
          });
        });
      });
      
      res.json({
        total: payments.length,
        offset: parseInt(offset),
        limit: parseInt(limit),
        data: payments,
      });
    } catch (error) {
      console.error('Error getting payment history:', error);
      res.status(500).json({ 
        message: 'Error al obtener el historial de pagos',
        error: error.message 
      });
    }
  }
}

export default new PaymentController();
