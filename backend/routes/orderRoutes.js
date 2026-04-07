import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById,
  createRazorpayOrder,
  verifyPayment,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/create', protect, createOrder);
router.get('/my', protect, getOrders);
router.get('/:id', protect, getOrderById);

// Razorpay routes
router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyPayment);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;