import mongoose from 'mongoose';
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
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }
    
    // Create admin user (Firebase Auth handles credentials)
    const admin = await User.create({
      name: 'Trends & Toss Admin',
      email: 'admin@trendsandtoss.com',
      role: 'admin',
      provider: 'email',
      firebaseUid: process.env.ADMIN_FIREBASE_UID || 'manual-admin',
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('\n📧 Email: admin@trendsandtoss.com');
    console.log('🔑 Password is managed via Firebase Auth console');
    console.log('\n⚠️  Ensure this email is registered in Firebase Auth!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();
