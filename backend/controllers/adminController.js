import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const getDashboard = async (req, res) => {
  const users = await User.countDocuments({ role: 'user' });
  const orders = await Order.countDocuments();
  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;
  res.json({ users, orders, totalRevenue });
};

export const getOrders = async (req, res) => {
  const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
  res.json(orders);
};

export const updateOrderStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.status }, { new: true });
  res.json(order);
};

// Get all users (admins only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Create new admin user
export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Create admin user
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });
    
    res.status(201).json({ 
      message: 'Admin created successfully',
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create admin' });
  }
};

// Delete admin user
export const deleteAdminUser = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (admin.role !== 'admin') {
      return res.status(400).json({ error: 'Can only delete admin users' });
    }
    
    // Prevent deleting yourself
    if (admin._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete admin' });
  }
};