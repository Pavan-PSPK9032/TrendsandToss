import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  items: [{
    productId: { type: String },
    quantity: { type: Number },
    price: { type: Number },
    name: { type: String }
  }],
  
  // Pricing breakdown
  subtotal: { type: Number, required: true },           // Items total only
  shippingCharge: { type: Number, default: 0 },         // Delivery charge
  totalPrice: { type: Number, required: true },         // subtotal + shippingCharge
  
  // Shipping details
  shippingAddress: { type: Object, required: true },
  shippingZone: { type: String },                       // 'Local', 'State', 'National'
  deliveryPincode: { type: String },                    // Customer's pincode
  
  // Payment details
  paymentStatus: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  
  // Order tracking
  orderStatus: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);