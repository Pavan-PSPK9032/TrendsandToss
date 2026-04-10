import express from 'express';
import {
  getCategories,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/slug/:slug/products', getProductsByCategory);

// Protected admin routes
router.get('/all', protect, admin, getAllCategories);
router.get('/:id', protect, admin, getCategoryById);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
