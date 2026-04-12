import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected admin routes
router.post('/', protect, isAdmin, upload.array('images', 3), createProduct);
router.put('/:id', protect, isAdmin, upload.array('images', 3), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;