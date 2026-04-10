import Product from '../models/Product.js';

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

// CREATE product (Cloudinary storage)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    // Handle image uploads - Cloudinary storage
    const images = req.files?.map(file => file.path) || [];
    
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
      const newImages = req.files.map(file => file.path); // Cloudinary URL
      images = [...images, ...newImages];
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

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
};