import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { sendWhatsAppTextMessage } from '../utils/whatsappService.js';

// 🔐 Generate JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check existing user
    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ error: 'Email already registered' });

    const phoneExists = await User.findOne({ phone });
    if (phoneExists)
      return res.status(400).json({ error: 'Phone number already registered' });

    // Create user
    const user = await User.create({ name, email, phone, password });

    const token = signToken(user._id);

    // 📧 Send Welcome Email (async)
    sendWelcomeEmail(user).catch((err) =>
      console.error('Welcome email failed:', err)
    );

    // 📱 Send WhatsApp Message (async)
    const welcomeMsg = `🎉 Welcome to Trends & Toss, ${name}!\n\nUse code WELCOME10 for 10% OFF.\nHappy Shopping! 🛍️`;
    sendWhatsAppTextMessage(phone, welcomeMsg).catch((err) =>
      console.error('WhatsApp failed:', err)
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email & password required' });
    }

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
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GOOGLE LOGIN ================= */
export const googleLogin = async (req, res) => {
  try {
    const { name, email, photo } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await User.findOne({ email });

    // 👉 If new user
    if (!user) {
      const randomPassword =
        Math.random().toString(36).slice(-10) + 'A1!';

      // ✅ FIXED: Always valid 10-digit phone
      const randomPhone = String(
        9000000000 + Math.floor(Math.random() * 1000000000)
      );

      user = await User.create({
        name: name || email.split('@')[0],
        email,
        phone: randomPhone, // ✅ FIXED ERROR
        password: randomPassword,
        photo: photo || '',
        isGoogleUser: true,
      });

      // 📧 Send welcome email
      sendWelcomeEmail(user).catch((err) =>
        console.error('Welcome email failed:', err)
      );
    } else {
      // Update photo if missing
      if (photo && !user.photo) {
        user.photo = photo;
        await user.save();
      }
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: err.message });
  }
};