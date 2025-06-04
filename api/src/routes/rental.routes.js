import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  createRental,
  getUserRentals,
  getItemRentals,
  updateRentalStatus
} from "../controllers/rental.controller.js";

const router = express.Router();

// Aplicar el middleware de autenticación a todas las rutas
router.use(verifyToken);

// Crear una nueva reserva
router.post('/', createRental);

// Obtener reservas del usuario actual
router.get('/my-rentals', getUserRentals);

// Obtener reservas de un artículo específico
router.get('/item/:itemId', getItemRentals);

// Actualizar estado de una reserva
router.patch('/:rentalId/status', updateRentalStatus);

export default router; 

