import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';

// GET all products with search, filter, pagination
export const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({ 
      products, 
      totalPages: Math.ceil(total / limit), 
      currentPage: Number(page),
      totalProducts: total 
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// GET single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// CREATE product (Cloudinary for production, local for dev)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    // Handle image uploads
    let images = [];
    
    if (req.files && req.files.length > 0) {
      if (process.env.NODE_ENV === 'production') {
        // Upload to Cloudinary
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'trendsandtoss-products',
            width: 800,
            height: 800,
            crop: 'limit',
            quality: 'auto'
          });
          images.push(result.secure_url);
        }
      } else {
        // Local storage for development
        images = req.files.map(file => `/uploads/${file.filename}`);
      }
    }
    
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      images
    });
    
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images: existingImages } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Start with existing images
    let images = existingImages || product.images || [];
    
    // Add new uploads if any
    if (req.files && req.files.length > 0) {
      if (process.env.NODE_ENV === 'production') {
        // Upload new images to Cloudinary
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'trendsandtoss-products',
            width: 800,
            height: 800,
            crop: 'limit',
            quality: 'auto'
          });
          images.push(result.secure_url);
        }
      } else {
        // Local storage for development
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        images = [...images, ...newImages];
      }
    }
    
    // Limit to 3 images max
    images = images.slice(0, 3);
    
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        description, 
        price: Number(price), 
        category, 
        stock: Number(stock), 
        images 
      },
      { new: true, runValidators: true }
    );
    
    res.json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
};

// DELETE product (also delete images from Cloudinary in production)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Delete images from Cloudinary in production
    if (process.env.NODE_ENV === 'production' && product.images?.length > 0) {
      for (const imageUrl of product.images) {
        // Extract public_id from Cloudinary URL
        const publicId = imageUrl.split('/').pop().split('.')[0];
        try {
          await cloudinary.uploader.destroy(`trendsandtoss-products/${publicId}`);
        } catch (err) {
          console.warn('Failed to delete image from Cloudinary:', publicId);
        }
      }
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
};