import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import crypto from 'crypto';
import { razorpay } from '../utils/razorpay.js';
import { sendOrderConfirmationEmail, sendWelcomeEmail } from '../utils/emailService.js';
import { sendOrderConfirmationWhatsApp, sendWhatsAppTextMessage } from '../utils/whatsappService.js';

// GET single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all orders for current user
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all orders (for admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = { amount: amount * 100, currency: 'INR', receipt: `order_${Date.now()}`, payment_capture: 1 };
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ error: err.message });
  }
};

// VERIFY Razorpay Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
    if (expectedSignature === razorpay_signature) {
      await Order.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { paymentStatus: 'paid', paymentId: razorpay_payment_id, orderStatus: 'Confirmed' });
      res.json({ success: true, message: 'Payment verified' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE Order Status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true, runValidators: true }).populate('userId', 'name email');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: `Order status updated to ${status}`, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE Order with Payment Info (Supports COD + Razorpay + Dynamic Shipping)
export const createOrder = async (req, res) => {
  try {
    const { 
      shippingAddress, 
      paymentId, 
      paymentStatus, 
      razorpayOrderId, 
      paymentMethod = 'razorpay',
      shippingCharge = 0,
      shippingZone,
      subtotal,
      total
    } = req.body;
    
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart?.items?.length) return res.status(400).json({ error: 'Cart is empty' });

    // Build items array
    const items = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price,
      name: item.productId.name
    }));

    // Determine payment & order status
    const isCOD = paymentMethod === 'cod';
    const finalPaymentStatus = isCOD ? 'pending' : (paymentStatus || 'pending');
    const finalOrderStatus = isCOD ? 'Pending' : (finalPaymentStatus === 'paid' ? 'Confirmed' : 'Pending');

    // Use passed total (with shipping) or calculate fallback
    const orderTotal = total !== undefined ? total : (subtotal || 0) + (shippingCharge || 0);
    const orderSubtotal = subtotal !== undefined ? subtotal : items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = await Order.create({
      userId: req.user._id,
      items,
      subtotal: orderSubtotal,
      shippingCharge: shippingCharge || 0,
      totalPrice: orderTotal,
      shippingAddress,
      shippingZone: shippingZone || 'Standard',
      deliveryPincode: shippingAddress?.pincode,
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      paymentId: isCOD ? null : paymentId,
      razorpayOrderId: isCOD ? null : razorpayOrderId,
      orderStatus: finalOrderStatus
    });

    // Clear cart after successful order
    await Cart.findOneAndDelete({ userId: req.user._id });
    await Cart.create({ userId: req.user._id, items: [] });

    // Populate order with user details for notifications
    const populatedOrder = await Order.findById(order._id).populate('userId', 'name email phone');

    // Send order confirmation notifications (async - don't block response)
    if (populatedOrder) {
      console.log('📧 Sending order confirmation notifications for order:', order._id);
      
      // Send email
      sendOrderConfirmationEmail(populatedOrder).then(result => {
        if (result.success) {
          console.log('✅ Order email sent successfully:', result.messageId);
        } else {
          console.error('❌ Order email failed:', result.error);
        }
      }).catch(err => console.error('❌ Email error:', err));

      // Send WhatsApp
      sendOrderConfirmationWhatsApp(populatedOrder).then(result => {
        if (result.success) {
          console.log('✅ Order WhatsApp sent successfully:', result.messageId);
        } else {
          console.error('❌ Order WhatsApp failed:', result.error);
        }
      }).catch(err => console.error('❌ WhatsApp error:', err));
    }

    res.status(201).json({ 
      message: isCOD ? 'Order placed successfully! Pay on delivery 📦' : 'Order placed successfully! 🎉', 
      order 
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message });
  }
};