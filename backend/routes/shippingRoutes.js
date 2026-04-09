import express from 'express';
import { checkDelivery, getDeliveryCharges } from '../controllers/deliveryController.js';

const router = express.Router();

// Check delivery for a pincode
router.get('/check/:pincode', checkDelivery);

// Bulk delivery charge calculation
router.post('/charges', getDeliveryCharges);

export default router;
