// src/services/review.service.js
import { db } from '../config/firebase.js';
import { getRentalsByItemId } from './rental.service.js';
import { updateItem } from './item.service.js';

const reviewsCollection = db.collection('reviews');

const createReview = async (itemId, userId, rating, comment = '') => {
  try {
    // Verificar si el usuario ha realizado una reserva para este artículo antes de poder valorarlo
    const existingRentals = await getRentalsByItemId(itemId);
    const hasRented = existingRentals.some(rental => rental.userId === userId && rental.status === 'completed');
    if (!hasRented) {
      throw new Error('Solo puedes valorar un artículo después de haberlo alquilado.');
    }

    // Verificar si el usuario ya ha dejado una valoración para este artículo
    const existingReview = await reviewsCollection.where('itemId', '==', itemId).where('userId', '==', userId).get();
    if (!existingReview.empty) {
      throw new Error('Ya has valorado este artículo.');
    }

    const newReview = {
      itemId,
      userId,
      rating: parseInt(rating, 10),
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await reviewsCollection.add(newReview);
    const review = await docRef.get();

    // Actualizar la calificación promedio del artículo
    await updateAverageRating(itemId);

    return { id: review.id, ...review.data() };
  } catch (error) {
    console.error('Error al crear la valoración:', error);
    throw error;
  }
};

const getReviewsByItemId = async (itemId) => {
  try {
    const snapshot = await reviewsCollection.where('itemId', '==', itemId).orderBy('createdAt', 'desc').get();
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return reviews;
  } catch (error) {
    console.error('Error al obtener las valoraciones del artículo:', error);
    throw error;
  }
};

const updateAverageRating = async (itemId) => {
  try {
    const snapshot = await reviewsCollection.where('itemId', '==', itemId).get();
    if (!snapshot.empty) {
      let totalRating = 0;
      snapshot.forEach(doc => {
        totalRating += doc.data().rating;
      });
      const averageRating = totalRating / snapshot.size;
      await updateItem(itemId, { averageRating });
    } else {
      await updateItem(itemId, { averageRating: null });
    }
  } catch (error) {
    console.error('Error al actualizar la puntuación promedio del artículo:', error);
    throw error;
  }
};

export { createReview, getReviewsByItemId, updateAverageRating };