// src/services/message.service.js
import { db } from '../config/firebase.js';
import { getRentalById } from './rental.service.js';

const messagesCollection = db.collection('messages');

const sendMessage = async (rentalId, senderId, receiverId, content) => {
  try {
    // Verificar si la reserva existe y si los remitente y destinatario están involucrados
    const rental = await getRentalById(rentalId);
    if (!rental || (rental.userId !== senderId && rental.ownerId !== senderId) || (rental.userId !== receiverId && rental.ownerId !== receiverId)) {
      throw new Error('No estás autorizado a enviar mensajes en esta reserva.');
    }

    const newMessage = {
      rentalId,
      senderId,
      receiverId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      readAt: null,
    };

    const docRef = await messagesCollection.add(newMessage);
    const message = await docRef.get();
    return { id: message.id, ...message.data() };
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
    throw error;
  }
};

const getMessagesForRental = async (rentalId, userId) => {
  try {
    // Verificar si el usuario tiene permiso para ver los mensajes de esta reserva
    const rental = await getRentalById(rentalId);
    if (!rental || (rental.userId !== userId && rental.ownerId !== userId)) {
      throw new Error('No estás autorizado a ver los mensajes de esta reserva.');
    }

    const snapshot = await messagesCollection
      .where('rentalId', '==', rentalId)
      .orderBy('createdAt', 'asc')
      .get();
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return messages;
  } catch (error) {
    console.error('Error al obtener los mensajes de la reserva:', error);
    throw error;
  }
};

const markMessagesAsRead = async (rentalId, userId) => {
  try {
    const snapshot = await messagesCollection
      .where('rentalId', '==', rentalId)
      .where('receiverId', '==', userId)
      .where('readAt', '==', null)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      const messageRef = messagesCollection.doc(doc.id);
      batch.update(messageRef, { readAt: new Date(), updatedAt: new Date() });
    });
    await batch.commit();
    return { message: `Mensajes de la reserva ${rentalId} marcados como leídos por el usuario ${userId}` };
  } catch (error) {
    console.error('Error al marcar los mensajes como leídos:', error);
    throw error;
  }
};

export { sendMessage, getMessagesForRental as getMessagesForBooking, markMessagesAsRead };