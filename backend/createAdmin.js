import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@trendsandtoss.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists!');
      console.log('Email: admin@trendsandtoss.com');
      console.log('Password: Admin@2024Secure');
      process.exit(0);
    }
    
    // Create admin user
    const admin = await User.create({
      name: 'Trends & Toss Admin',
      email: 'admin@trendsandtoss.com',
      password: 'Admin@2024Secure',
      role: 'admin'
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('\n📧 Email: admin@trendsandtoss.com');
    console.log('🔑 Password: Admin@2024Secure');
    console.log('\n⚠️  Please change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();