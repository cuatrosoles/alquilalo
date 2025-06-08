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

// Configuración de CORS
const allowedOrigins = [
  "https://alquilalo-api.vercel.app", // Tu API
  "https://alquilalo-user.vercel.app", // Frontend User
  "https://alquilalo-admin.vercel.app", // Frontend Admin
  "https://api.mercadopago.com",
  "https://www.mercadopago.com",
  "https://www.mercadopago.com.ar",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5000",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
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

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/insurance-claims", insuranceClaimRoutes);

// Ruta de prueba
app.get("/api", (req, res) => {
  res.json({
    message: "🚀 ¡Bienvenido a la API de Alquilalo!",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    status: "online",
  });
});

// Ruta de health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

export default app;
