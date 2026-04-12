import firebaseAdmin from '../config/firebase.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = await User.findOne({ firebaseUid: decoded.uid });
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin only.' });
  }
};
