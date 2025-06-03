// src/config/firebase.js
import admin from "firebase-admin";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import config from "./config.js";

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Usar credenciales desde la variable de entorno
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: config.firebaseConfig.projectId,
      // Añadir storageBucket si lo usas con Admin SDK
      storageBucket: config.firebaseConfig.storageBucket,
    });
  } catch (error) {
    console.error(
      "Error al inicializar Firebase Admin SDK con variable de entorno:",
      error
    );
    // Si falla la inicialización con variable de entorno, puedes intentar otras opciones o lanzar un error
    throw new Error(
      "Failed to initialize Firebase Admin SDK: " + error.message
    );
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
