import express from 'express';
import { calculateShipping } from '../config/shipping.js';

const router = express.Router();

// POST /api/shipping/calculate
// Body: { pincode: "500055", cartTotal: 799 }
router.post('/calculate', (req, res) => {
  try {
    const { pincode, cartTotal } = req.body;
    
    if (!pincode || typeof cartTotal !== 'number') {
      return res.status(400).json({ error: 'Pincode and cartTotal are required' });
    }
    
    const result = calculateShipping(pincode, cartTotal);
    
    res.json({
      success: true,
      shippingCharge: result.charge,
      zone: result.zone,
      message: result.message,
      estimatedDays: result.estimatedDays,
      isFree: result.isFree
    });
  } catch (err) {
    console.error('Shipping calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate shipping' });
  }
});

export default router;