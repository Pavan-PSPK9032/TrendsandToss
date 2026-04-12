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
      console.log('Run: node createAdmin.js');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Provider:', admin.provider);
    console.log('Firebase UID:', admin.firebaseUid || 'Not linked');
    console.log('Created at:', admin.createdAt);

    if (admin.role !== 'admin') {
      console.log('\n⚠️  User exists but role is not admin!');
      console.log('Updating role to admin...');
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Role updated to admin');
    } else {
      console.log('\n✅ Admin role confirmed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkAdmin();
