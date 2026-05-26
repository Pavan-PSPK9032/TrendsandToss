import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  images: [{ type: String }],
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['in_stock', 'out_of_stock'], default: 'in_stock' }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  this.status = this.stock > 0 ? 'in_stock' : 'out_of_stock';
  next();
});

productSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.stock !== undefined) {
    update.status = update.stock > 0 ? 'in_stock' : 'out_of_stock';
  }
  next();
});

export default mongoose.model('Product', productSchema);