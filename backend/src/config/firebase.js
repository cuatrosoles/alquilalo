// src/config/firebase.js
import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from './config.js';

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: config.firebaseConfig.projectId,
    });
  } catch (error) {
    console.error('Error al inicializar Firebase Admin SDK:', error);
    if (config.firebaseConfig.apiKey) {
      admin.initializeApp({
        apiKey: config.firebaseConfig.apiKey,
        authDomain: config.firebaseConfig.authDomain,
        projectId: config.firebaseConfig.projectId,
        storageBucket: config.firebaseConfig.storageBucket,
        messagingSenderId: config.firebaseConfig.messagingSenderId,
        appId: config.firebaseConfig.appId,
        measurementId: config.firebaseConfig.measurementId,
      });
    } else {
      console.error('No se encontraron credenciales de Firebase.');
    }
  }
}

// Inicializar Firebase Client SDK
const firebaseApp = initializeApp(config.firebaseConfig);
const clientDb = getFirestore(firebaseApp);
const clientAuth = getAuth(firebaseApp);

// Admin SDK
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { db, auth, storage, admin, clientDb, clientAuth };