// src/routes/insuranceClaim.routes.js
import express from 'express';
import { 
  createNewClaim,
  getUserClaims,
  getClaim 
} from '../controllers/insuranceClaim.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
// Middleware para roles de administrador (se implementará más adelante)
// import { isAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// Rutas para usuarios
router.post('/', verifyToken, createNewClaim);
router.get('/user', verifyToken, getUserClaims);
router.get('/:id', verifyToken, getClaim);

// Rutas para administradores (requerirán el middleware isAdmin)
// router.get('/admin/all', verifyToken, isAdmin, getAllClaimsHandler);
// router.patch('/admin/:id/status', verifyToken, isAdmin, updateClaimStatusHandler);

export default router;


