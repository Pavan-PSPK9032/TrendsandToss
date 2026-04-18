import express from 'express';
import { validateCoupon, createCoupon, getAllCoupons, getActiveCoupons, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/validate', validateCoupon);
router.get('/active', getActiveCoupons);

// Admin routes
router.post('/', protect, isAdmin, createCoupon);
router.get('/', protect, isAdmin, getAllCoupons);
router.put('/:id', protect, isAdmin, updateCoupon);
router.delete('/:id', protect, isAdmin, deleteCoupon);

export default router;
