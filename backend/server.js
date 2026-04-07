import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { upload } from './middleware/uploadMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Allow all origins for development
  credentials: true
}));
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle Cloudinary uploads if needed
app.post('/upload', upload.single('image'), (req, res) => {
  // Cloudinary upload logic
  res.json({ url: req.file.path });
});

// Route handlers (API)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shipping', require('./routes/shippingRoutes').default);

// Serve frontend build files (Production Only)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'frontend/dist/index.html'));
});

const PORT = process.env.PORT || 443; // Vercel uses 443 for HTTPS
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));