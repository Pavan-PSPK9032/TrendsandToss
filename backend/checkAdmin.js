import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@trendsandtoss.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Created at:', admin.createdAt);
    console.log('Password (hashed):', admin.password.substring(0, 30) + '...');

    // Test password match
    const bcrypt = await import('bcryptjs');
    const testPassword = 'Admin@2024Secure';
    const isMatch = await bcrypt.default.compare(testPassword, admin.password);
    
    console.log('\n🔐 Password Test:');
    console.log('Testing password:', testPassword);
    console.log('Password matches:', isMatch ? '✅ YES' : '❌ NO');

    if (!isMatch) {
      console.log('\n⚠️  Password does not match! Creating new admin...');
      
      // Delete old admin
      await User.deleteOne({ email: 'admin@trendsandtoss.com' });
      console.log('✅ Deleted old admin user');

      // Create new admin
      const newAdmin = await User.create({
        name: 'Trends & Toss Admin',
        email: 'admin@trendsandtoss.com',
        password: 'Admin@2024Secure',
        role: 'admin'
      });

      console.log('\n✅ New admin user created!');
      console.log('📧 Email: admin@trendsandtoss.com');
      console.log('🔑 Password: Admin@2024Secure');

      // Verify again
      const verifyMatch = await bcrypt.default.compare('Admin@2024Secure', newAdmin.password);
      console.log('✅ Verified - Password matches:', verifyMatch);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkAdmin();
