import mongoose from 'mongoose';

// 🔴 REPLACE THESE WITH YOUR ACTUAL VALUES
const username = 'Myadmin';
const password = 'test123';
const cluster = 'cluster0.lxx62m5.mongodb.net'; // From your Atlas URL

const uri = mongodb+srv://polisettypavankumar02224_db_user:test123@cluster0.rqpq4b1.mongodb.net/;
console.log('🔍 Testing connection...');
console.log('URI:', uri.replace(password, '****'));

mongoose.connect(uri)
  .then(() => {
    console.log('✅ SUCCESS! MongoDB connected!');
    console.log('Connection is working - your credentials are correct');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ FAILED!');
    console.log('Error:', err.message);
    console.log('Error code:', err.code);
    console.log('\n📋 Common fixes:');
    console.log('1. Check username is correct (case-sensitive)');
    console.log('2. Check password is correct (case-sensitive)');
    console.log('3. Wait 2-3 minutes after creating user');
    console.log('4. Check IP is whitelisted (0.0.0.0/0)');
    process.exit(1);
  });