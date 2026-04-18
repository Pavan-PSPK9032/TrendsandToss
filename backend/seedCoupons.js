// Run this script to seed coupons in your database
// Execute: node seedCoupons.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from './models/Coupon.js';

dotenv.config();

const seedCoupons = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing coupons
    await Coupon.deleteMany({});
    console.log('🗑️  Cleared existing coupons\n');

    // Create sample coupons
    const coupons = [
      {
        code: 'WELCOME10',
        description: 'Welcome offer! Get 10% off on your first order',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 299,
        maxDiscountAmount: 100,
        usageLimit: 1000,
        isActive: true,
        validUntil: new Date('2027-12-31')
      },
      {
        code: 'SAVE50',
        description: 'Flat ₹50 off on orders above ₹499',
        discountType: 'fixed',
        discountValue: 50,
        minOrderValue: 499,
        usageLimit: 500,
        isActive: true,
        validUntil: new Date('2027-12-31')
      },
      {
        code: 'MEGA20',
        description: 'Mega sale! 20% off on all products',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 999,
        maxDiscountAmount: 300,
        usageLimit: 200,
        isActive: true,
        validUntil: new Date('2027-06-30')
      },
      {
        code: 'FREESHIP',
        description: 'Get ₹50 off (covers shipping cost)',
        discountType: 'fixed',
        discountValue: 50,
        minOrderValue: 199,
        usageLimit: null,
        isActive: true,
        validUntil: new Date('2027-12-31')
      },
      {
        code: 'SUPER100',
        description: 'Flat ₹100 off on orders above ₹999',
        discountType: 'fixed',
        discountValue: 100,
        minOrderValue: 999,
        usageLimit: 300,
        isActive: true,
        validUntil: new Date('2027-12-31')
      }
    ];

    await Coupon.insertMany(coupons);
    console.log('✅ Coupons created successfully!\n');
    console.log('📋 Available Coupons:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    coupons.forEach(c => {
      console.log(`   🎫 ${c.code}`);
      console.log(`      ${c.description}`);
      console.log(`      Min order: ₹${c.minOrderValue}\n`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedCoupons();
