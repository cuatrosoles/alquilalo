import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import serverless from "serverless-http";

// Importar tus rutas existentes
import authRoutes from "../../api/src/routes/auth.routes.js";
import itemRoutes from "../../api/src/routes/item.routes.js";
import categoryRoutes from "../../api/src/routes/category.routes.js";
import rentalRoutes from "../../api/src/routes/rental.routes.js";
import messageRoutes from "../../api/src/routes/message.routes.js";
import reviewRoutes from "../../api/src/routes/review.routes.js";
import paymentRoutes from "../../api/src/routes/payment.routes.js";
import insuranceClaimRoutes from "../../api/src/routes/insuranceClaim.routes.js";

dotenv.config();

const app = express();

// Configuración de CORS
const allowedOrigins = [
  "https://alquilalo.netlify.app",
  "https://alquilalo-admin.netlify.app",
  "https://api.mercadopago.com",
  "https://www.mercadopago.com",
  "https://www.mercadopago.com.ar",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
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
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rutas de la API
app.use("/.netlify/functions/api/auth", authRoutes);
app.use("/.netlify/functions/api/items", itemRoutes);
app.use("/.netlify/functions/api/categories", categoryRoutes);
app.use("/.netlify/functions/api/rentals", rentalRoutes);
app.use("/.netlify/functions/api/messages", messageRoutes);
app.use("/.netlify/functions/api/reviews", reviewRoutes);
app.use("/.netlify/functions/api/payments", paymentRoutes);
app.use("/.netlify/functions/api/insurance-claims", insuranceClaimRoutes);

// Ruta de prueba
app.get("/.netlify/functions/api", (req, res) => {
  res.json({
    message: "🚀 ¡API de Alquilalo en Netlify!",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

export const handler = serverless(app);
