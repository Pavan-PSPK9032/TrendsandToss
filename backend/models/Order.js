import mongoose from 'mongoose';

const trackingEntrySchema = new mongoose.Schema({
  status: { type: String, required: true },
  location: { type: String },
  description: { type: String },
  date: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  items: [{
    productId: { type: String },
    quantity: { type: Number },
    price: { type: Number },
    name: { type: String }
  }],
  
  // Pricing breakdown
  subtotal: { type: Number, required: true },
  shippingCharge: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  
  // Shipping details
  shippingAddress: { type: Object, required: true },
  shippingZone: { type: String },
  deliveryPincode: { type: String },
  
  // Payment details
  paymentStatus: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  
  // Order tracking
  orderStatus: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  trackingNumber: { type: String },
  trackingUrl: { type: String },
  courier: { type: String },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  trackingHistory: [trackingEntrySchema],
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);