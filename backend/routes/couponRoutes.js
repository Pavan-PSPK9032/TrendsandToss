import express from 'express';
import { validateCoupon, createCoupon, getAllCoupons, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - validate coupon
router.post('/validate', validateCoupon);

// Admin routes
router.post('/', protect, isAdmin, createCoupon);
router.get('/', protect, isAdmin, getAllCoupons);
router.put('/:id', protect, isAdmin, updateCoupon);
router.delete('/:id', protect, isAdmin, deleteCoupon);

export default router;
