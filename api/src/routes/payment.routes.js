// src/routes/payment.routes.js
import express from 'express';
const router = express.Router();
import PaymentController from '../controllers/payment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

// Create payment preference
router.post('/create-preference', verifyToken, PaymentController.createPaymentPreference);

// Handle MercadoPago webhook
router.post('/webhook', express.json({ verify: (req, res, buf) => {
  req.rawBody = buf.toString();
} }), PaymentController.handleWebhook);

// Get payment status
router.get('/status/:paymentId', verifyToken, PaymentController.getPaymentStatus);

// Get payment history for a user
router.get('/history', verifyToken, PaymentController.getPaymentHistory);

export default router;
