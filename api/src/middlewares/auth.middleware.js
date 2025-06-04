// src/middlewares/auth.middleware.js
import authService from '../services/auth.service.js';

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: 'Acceso no autorizado: Token no proporcionado' });
    }
    const user = await authService.verifyToken(token);
    if (user) {
      req.user = user; // Adjuntar la información del usuario al objeto de la petición
      next(); // Pasar al siguiente middleware o controlador
    } else {
      return res.status(401).json({ message: 'Acceso no autorizado: Token inválido' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error al verificar el token' });
  }
};

export { verifyToken };