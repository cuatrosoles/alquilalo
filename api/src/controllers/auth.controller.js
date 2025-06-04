// src/controllers/auth.controller.js
import authService from '../services/auth.service.js';

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.register(name, email, password);
    res.status(201).json({ message: 'Usuario registrado exitosamente', user });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(400).json({ 
      message: error.message || 'Error al registrar usuario',
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son requeridos',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const { token, user } = await authService.login(email, password);
    res.json({ 
      message: 'Inicio de sesión exitoso', 
      token, 
      user 
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(401).json({ 
      message: error.message || 'Credenciales inválidas',
      code: error.code || 'INVALID_CREDENTIALS'
    });
  }
};

const verifyUserToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ 
        message: 'Token no proporcionado',
        code: 'MISSING_TOKEN'
      });
    }
    const user = await authService.verifyToken(token);
    if (user) {
      res.json({ user });
    } else {
      res.status(401).json({ 
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Error en verificación de token:', error);
    res.status(500).json({ 
      message: error.message || 'Error al verificar el token',
      code: error.code || 'TOKEN_VERIFICATION_ERROR'
    });
  }
};

export default { registerUser, loginUser, verifyUserToken }; 
