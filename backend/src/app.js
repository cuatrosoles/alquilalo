// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import itemRoutes from "./routes/item.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import rentalRoutes from "./routes/rental.routes.js";
import messageRoutes from "./routes/message.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import insuranceClaimRoutes from "./routes/insuranceClaim.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "../frontend/user/dist")));

// Handle requests by serving index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/user/dist", "index.html"));
});

// Configuración de CORS
const allowedOrigins = [
  "https://alquilalo.vercel.app",
  //'https://alquilalo.onrender.com',
  //'https://alquilalo-admin.onrender.com',
  "https://api.mercadopago.com",
  "https://www.mercadopago.com",
  "https://www.mercadopago.com.ar",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configuración para el webhook de MercadoPago
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Usa las rutas de autenticación
app.use("/api/auth", authRoutes);
// Usa las rutas de artículos
app.use("/api/items", itemRoutes);
// Usa las rutas de categorías
app.use("/api/categories", categoryRoutes);
// Usa las rutas de alquileres
app.use("/api/rentals", rentalRoutes);
// Usa las rutas de mensajes
app.use("/api/messages", messageRoutes);
// Usa las rutas de valoraciones
app.use("/api/reviews", reviewRoutes);
// Usa las rutas de pagos
app.use("/api/payments", paymentRoutes);
// Usa las rutas de reclamaciones de seguro
app.use("/api/insurance-claims", insuranceClaimRoutes);

// Configuración para servir archivos estáticos en producción
if (process.env.NODE_ENV === "production") {
  // Servir archivos estáticos de React
  app.use(express.static(path.join(__dirname, "../../../frontend/user/build")));

  // Manejar cualquier otra ruta que no sea de la API
  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "../../../frontend/user/build", "index.html")
    );
  });
}

// Ruta de prueba
app.get("/api", (req, res) => {
  res.json({
    message: "¡Bienvenido a la API de Alquilalo!",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

export default app;
