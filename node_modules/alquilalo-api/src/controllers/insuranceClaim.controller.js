// src/controllers/insuranceClaim.controller.js
import * as insuranceClaimService from "../services/insuranceClaim.service.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
// Middleware para roles de administrador (se implementará más adelante)
// import { isAdmin } from "../middlewares/role.middleware.js";

const createNewClaim = async (req, res) => {
  try {
    const { bookingId, reason, description } = req.body;
    const claimantId = req.user.uid;
    const claim = await insuranceClaimService.createClaim(bookingId, claimantId, reason, description);
    res.status(201).json({ message: 'Reclamación de seguro creada exitosamente', claim });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error al crear la reclamación' });
  }
};

const getClaim = async (req, res) => {
  try {
    const claimId = req.params.id;
    const claim = await insuranceClaimService.getClaimById(claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Reclamación no encontrada' });
    }
    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error al obtener la reclamación' });
  }
};

const getUserClaims = async (req, res) => {
  try {
    const userId = req.user.uid;
    const claims = await insuranceClaimService.getClaimsByUserId(userId);
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error al obtener las reclamaciones del usuario' });
  }
};

// Rutas para administradores (requerirán el middleware isAdmin)
const getAllClaimsHandler = async (req, res) => {
  try {
    const { status } = req.query;
    const claims = await insuranceClaimService.getAllClaims(status);
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error al obtener todas las reclamaciones' });
  }
};

const updateClaimStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedClaim = await insuranceClaimService.updateClaimStatus(id, status);
    res.json({ message: 'Estado de la reclamación actualizado', claim: updatedClaim });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error al actualizar el estado de la reclamación' });
  }
};

export { 
  createNewClaim, 
  getClaim, 
  getUserClaims, 
  getAllClaimsHandler, 
  updateClaimStatusHandler 
};

