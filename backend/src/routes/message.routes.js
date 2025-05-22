// src/routes/message.routes.js
import express from 'express';
import { 
  sendMessageHandler, 
  getBookingMessagesHandler, 
  markAsReadHandler 
} from '../controllers/message.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Enviar un nuevo mensaje (requiere autenticación)
router.post('/', verifyToken, sendMessageHandler);

// Obtener mensajes de una reserva (requiere autenticación)
router.get('/booking/:bookingId', verifyToken, getBookingMessagesHandler);

// Marcar mensajes como leídos (requiere autenticación)
router.patch('/booking/:bookingId/read', verifyToken, markAsReadHandler);

export default router;

