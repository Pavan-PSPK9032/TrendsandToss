import express from 'express';
import { getDashboard, getOrders, updateOrderStatus } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect + admin middleware to all admin routes
router.use(protect, admin);

router.get('/dashboard', getDashboard);
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router; // 👈 THIS LINE IS REQUIRED