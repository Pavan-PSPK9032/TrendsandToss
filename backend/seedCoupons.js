import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from './models/Coupon.js';

dotenv.config();

const seedCoupons = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if coupons already exist
    const existingCount = await Coupon.countDocuments();
    if (existingCount > 0) {
      console.log('⚠️  Coupons already exist!');
      process.exit(0);
    }

    // Create sample coupons
    const coupons = [
      {
        code: 'WELCOME10',
        description: 'Welcome offer! Get 10% off on your first order',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 299,
        maxDiscountAmount: 100,
        usageLimit: 100,
        isActive: true,
        validUntil: new Date('2026-12-31')
      },
      {
        code: 'SAVE50',
        description: 'Flat ₹50 off on orders above ₹499',
        discountType: 'fixed',
        discountValue: 50,
        minOrderValue: 499,
        usageLimit: 200,
        isActive: true,
        validUntil: new Date('2026-12-31')
      },
      {
        code: 'MEGA20',
        description: 'Mega sale! 20% off on all products',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 999,
        maxDiscountAmount: 300,
        usageLimit: 50,
        isActive: true,
        validUntil: new Date('2026-06-30')
      },
      {
        code: 'FREESHIP',
        description: 'Free shipping on any order',
        discountType: 'fixed',
        discountValue: 50,
        minOrderValue: 199,
        usageLimit: null,
        isActive: true,
        validUntil: new Date('2026-12-31')
      }
    ];

    await Coupon.insertMany(coupons);
    console.log('✅ Sample coupons created successfully!\n');
    console.log('📋 Available Coupons:');
    coupons.forEach(c => {
      console.log(`   - ${c.code}: ${c.description}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedCoupons();
