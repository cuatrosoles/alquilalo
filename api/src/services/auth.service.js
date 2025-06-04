// src/services/auth.service.js
import { auth, db } from '../config/firebase.js';
import userSchema from '../models/user.model.js';

const usersCollection = db.collection('users');

const register = async (name, email, password) => {
  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name,
    });

    const newUser = {
      uid: userRecord.uid,
      name: name,
      email: email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.doc(userRecord.uid).set(newUser);
    return newUser;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    if (error.code === 'auth/email-already-exists') {
      throw new Error('El correo electrónico ya está registrado');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('El correo electrónico no es válido');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña es demasiado débil');
    }
    throw error;
  }
};

const login = async (email, password) => {
  try {
    // Obtener el usuario por email
    const userRecord = await auth.getUserByEmail(email);
    
    // Obtener los datos del usuario de Firestore
    const userDoc = await usersCollection.doc(userRecord.uid).get();
    if (!userDoc.exists) {
      throw new Error('Usuario no encontrado en la base de datos');
    }
    
    const userData = userDoc.data();
    
    try {
      // Crear un token personalizado
      const customToken = await auth.createCustomToken(userRecord.uid);
      
      return { 
        token: customToken, 
        user: {
          ...userData,
          uid: userRecord.uid
        }
      };
    } catch (tokenError) {
      console.error('Error al crear token:', tokenError);
      if (tokenError.code === 'auth/insufficient-permission') {
        throw new Error('Error de configuración del servidor. Por favor, contacta al administrador.');
      }
      throw new Error('Error al generar el token de autenticación');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('Usuario no encontrado');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('El correo electrónico no es válido');
    } else if (error.code === 'auth/insufficient-permission') {
      throw new Error('Error de configuración del servidor. Por favor, contacta al administrador.');
    }
    throw new Error('Credenciales inválidas');
  }
};

const verifyToken = async (token) => {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const userDoc = await usersCollection.doc(uid).get();
    const userData = userDoc.data();
    return userData;
  } catch (error) {
    console.error('Error al verificar token:', error);
    if (error.code === 'auth/id-token-expired') {
      throw new Error('La sesión ha expirado');
    } else if (error.code === 'auth/invalid-id-token') {
      throw new Error('Token inválido');
    }
    return null;
  }
};

export default { register, login, verifyToken }; 
