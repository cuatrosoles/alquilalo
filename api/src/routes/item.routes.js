// src/routes/item.routes.js
import express from "express";
import {
  createNewItem,
  getItem,
  getAllItemsHandler,
  updateExistingItem,
  deleteExistingItem,
  searchItemsHandler,
} from "../controllers/item.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import multer from "multer"; // Para la subida de archivos

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Almacenar archivos en memoria antes de subirlos a Firebase Storage

// Rutas específicas primero
router.get("/search", searchItemsHandler);
router.get("/", getAllItemsHandler);

// Rutas con parámetros después
router.post("/", verifyToken, upload.array("images", 5), createNewItem); // Requiere autenticación y permite hasta 5 imágenes
router.get("/:id", getItem);
router.put("/:id", verifyToken, upload.array("images", 5), updateExistingItem); // Requiere autenticación y permite hasta 5 imágenes
router.delete("/:id", verifyToken, deleteExistingItem); // Requiere autenticación

export default router;
