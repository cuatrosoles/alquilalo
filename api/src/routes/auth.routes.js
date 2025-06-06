// src/routes/auth.routes.js
import express from 'express';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/verify-token', authController.verifyUserToken); // Ruta para verificar el token (puede ser útil para el frontend)

export default router; 
