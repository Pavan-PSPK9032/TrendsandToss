import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, 'Please provide a valid email address']
  },
  phone: { 
    type: String, 
    required: false,
    unique: true,
    sparse: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number']
  },
  password: { type: String, required: false },
  photo: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  provider: { type: String, enum: ['google', 'email'], required: true },
  firebaseUid: { type: String, unique: true, sparse: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
