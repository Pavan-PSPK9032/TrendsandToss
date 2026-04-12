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
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/slug/:slug/products', getProductsByCategory);

// Protected admin routes
router.get('/all', protect, isAdmin, getAllCategories);
router.get('/:id', protect, isAdmin, getCategoryById);
router.post('/', protect, isAdmin, createCategory);
router.put('/:id', protect, isAdmin, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

export default router;
