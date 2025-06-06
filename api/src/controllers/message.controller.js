// src/controllers/message.controller.js
import * as messageService from "../services/message.service.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const sendMessageHandler = async (req, res) => {
  try {
    const { bookingId, receiverId, content } = req.body;
    const senderId = req.user.uid;
    const message = await messageService.sendMessage(bookingId, senderId, receiverId, content);
    res.status(201).json({ message: 'Mensaje enviado exitosamente', message });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error al enviar el mensaje' });
  }
};

const getBookingMessagesHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.uid;
    const messages = await messageService.getMessagesForBooking(bookingId, userId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error al obtener los mensajes' });
  }
};

const markAsReadHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.uid;
    const result = await messageService.markMessagesAsRead(bookingId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error al marcar los mensajes como leídos' });
  }
};

export { sendMessageHandler, getBookingMessagesHandler, markAsReadHandler };
