// src/services/insuranceClaim.service.js
import { db } from '../config/firebase.js';
import { getRentalById } from './rental.service.js';

const claimsCollection = db.collection('insurance_claims');

const createClaim = async (rentalId, claimantId, reason, description) => {
  try {
    // Verificar si la reserva existe y está completada o en curso
    const rental = await getRentalById(rentalId);
    if (!rental || (rental.status !== 'ongoing' && rental.status !== 'completed')) {
      throw new Error('Solo se pueden presentar reclamaciones para reservas en curso o completadas.');
    }

    const newClaim = {
      rentalId,
      claimantId,
      reason,
      description,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await claimsCollection.add(newClaim);
    const claim = await docRef.get();
    return { id: claim.id, ...claim.data() };
  } catch (error) {
    console.error('Error al crear la reclamación:', error);
    throw error;
  }
};

const getClaimById = async (claimId) => {
  try {
    const claimDoc = await claimsCollection.doc(claimId).get();
    if (!claimDoc.exists) {
      return null;
    }
    return { id: claimDoc.id, ...claimDoc.data() };
  } catch (error) {
    console.error('Error al obtener la reclamación:', error);
    throw error;
  }
};

const getClaimsByUserId = async (userId) => {
  try {
    const snapshot = await claimsCollection.where('claimantId', '==', userId).orderBy('createdAt', 'desc').get();
    const claims = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return claims;
  } catch (error) {
    console.error('Error al obtener las reclamaciones del usuario:', error);
    throw error;
  }
};

// Funcionalidad para el administrador para gestionar las reclamaciones
const getAllClaims = async (statusFilter = null) => {
  try {
    let query = claimsCollection.orderBy('createdAt', 'desc');
    if (statusFilter) {
      query = query.where('status', '==', statusFilter);
    }
    const snapshot = await query.get();
    const claims = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return claims;
  } catch (error) {
    console.error('Error al obtener todas las reclamaciones:', error);
    throw error;
  }
};

const updateClaimStatus = async (claimId, newStatus) => {
  try {
    await claimsCollection.doc(claimId).update({ status: newStatus, updatedAt: new Date() });
    const updatedClaimDoc = await claimsCollection.doc(claimId).get();
    return { id: updatedClaimDoc.id, ...updatedClaimDoc.data() };
  } catch (error) {
    console.error('Error al actualizar el estado de la reclamación:', error);
    throw error;
  }
};

export { createClaim, getClaimById, getClaimsByUserId, getAllClaims, updateClaimStatus };