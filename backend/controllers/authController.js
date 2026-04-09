import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { sendWhatsAppTextMessage } from '../utils/whatsappService.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Check if email or phone already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ error: 'Email already registered' });
    
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) return res.status(400).json({ error: 'Phone number already registered' });

    const user = await User.create({ name, email, phone, password });
    const token = signToken(user._id);
    
    // Send welcome email (async - don't block response)
    sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));
    
    // Send welcome WhatsApp (async)
    const welcomeMsg = `🎉 Welcome to Trends & Toss, ${name}!\n\nThank you for joining us! Use code WELCOME10 to get 10% off on your first order.\n\nHappy Shopping! 🛍️`;
    sendWhatsAppTextMessage(phone, welcomeMsg).catch(err => console.error('Welcome WhatsApp failed:', err));
    
    res.status(201).json({ 
      token, 
      user: { id: user._id, name: user.name, email, phone: user.phone, role: user.role } 
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        role: user.role 
      } 
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};