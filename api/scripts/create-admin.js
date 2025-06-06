const admin = require("firebase-admin");
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://multirent-918e4.firebaseio.com",
});

const auth = admin.auth();
const db = admin.firestore();

async function createAdminUser(email, password) {
  try {
    // Crear el usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true,
    });

    // Crear el documento de usuario con rol admin
    await db.collection("users").doc(userRecord.uid).set({
      email,
      role: "admin",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Usuario administrador creado exitosamente:", userRecord.uid);
    console.log("Email:", email);
    console.log("Contraseña:", password);
  } catch (error) {
    console.error("Error al crear el usuario administrador:", error);
  }
}

// Ejemplo de usuario administrador
const adminEmail = "admin@alquilalo.com";
const adminPassword = "Admin123!";

createAdminUser(adminEmail, adminPassword);
