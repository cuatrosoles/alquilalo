// src/config/config.js
import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  databaseUrl: "https://multirent-918e4.firebaseio.com", // Por ahora, aunque usaremos Firebase
  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  },
  mercadoPago: {
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  },
  // Otras configuraciones podrían ir aquí
};

export default config;
