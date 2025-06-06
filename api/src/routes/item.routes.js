// src/routes/item.routes.js
import express from 'express';
import { 
  createNewItem, 
  getItem, 
  getAllItemsHandler, 
  updateExistingItem, 
  deleteExistingItem 
} from '../controllers/item.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import multer from 'multer'; // Para la subida de archivos

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Almacenar archivos en memoria antes de subirlos a Firebase Storage

router.post('/', verifyToken, upload.array('images', 5), createNewItem); // Requiere autenticación y permite hasta 5 imágenes
router.get('/:id', getItem);
router.get('/', getAllItemsHandler);
router.put('/:id', verifyToken, upload.array('images', 5), updateExistingItem); // Requiere autenticación y permite hasta 5 imágenes
router.delete('/:id', verifyToken, deleteExistingItem); // Requiere autenticación

export default router;