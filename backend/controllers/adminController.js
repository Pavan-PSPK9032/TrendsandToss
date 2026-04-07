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