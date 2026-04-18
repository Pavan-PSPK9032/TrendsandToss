import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // Selling price
  originalPrice: { type: Number }, // MRP (original price before discount)
  images: [{ type: String }],
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);