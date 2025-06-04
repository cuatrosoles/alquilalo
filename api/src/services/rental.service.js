import { clientDb } from '../config/firebase.js';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

const rentalsCollection = collection(clientDb, 'rentals');

const getRentalById = async (rentalId) => {
  try {
    const rentalDoc = await getDoc(doc(clientDb, 'rentals', rentalId));
    if (!rentalDoc.exists()) {
      return null;
    }
    return { id: rentalDoc.id, ...rentalDoc.data() };
  } catch (error) {
    console.error('Error al obtener la reserva:', error);
    throw error;
  }
};

const getRentalsByItemId = async (itemId) => {
  try {
    const q = query(rentalsCollection, where('itemId', '==', itemId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener las reservas del artículo:', error);
    throw error;
  }
};

const getRentalsByUserId = async (userId) => {
  try {
    const borrowerQuery = query(rentalsCollection, where('userId', '==', userId));
    const ownerQuery = query(rentalsCollection, where('ownerId', '==', userId));
    
    const [borrowerSnapshot, ownerSnapshot] = await Promise.all([
      getDocs(borrowerQuery),
      getDocs(ownerQuery)
    ]);

    const rentals = [
      ...borrowerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...ownerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ];

    return rentals;
  } catch (error) {
    console.error('Error al obtener las reservas del usuario:', error);
    throw error;
  }
};

export { getRentalById, getRentalsByItemId, getRentalsByUserId };