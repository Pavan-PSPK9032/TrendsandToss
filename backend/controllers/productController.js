import Product from '../models/Product.js';

// GET all products with search, filter, pagination
export const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    
    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    
    const total = await Product.countDocuments(query);
    
    res.json({ 
      products, 
      totalPages: Math.ceil(total / limit), 
      currentPage: Number(page),
      totalProducts: total 
    });
  } catch (err) {
    console.error('Get products error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Failed to fetch products', detail: err.message });
  }
};

// GET single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
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
    const { name, description, price, originalPrice, category, stock } = req.body;
    
    console.log('Creating product with:', { name, description, price, originalPrice, category, stock });
    console.log('Uploaded files:', req.files);
    
    // Handle image uploads - Cloudinary storage
    const images = req.files?.map(file => {
      console.log('File path:', file.path);
      return file.path;
    }) || [];
    
    console.log('Image URLs:', images);
    
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      stock: Number(stock),
      images
    });
    
    console.log('Product created successfully:', product._id);
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, stock, images: existingImages } = req.body;
    
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
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
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

// DELETE ALL products
export const deleteAllProducts = async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.json({ message: `All products deleted successfully`, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Delete all products error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete all products' });
  }
};

// PATCH product price (partial update)
export const updateProductPrice = async (req, res) => {
  try {
    const { price, originalPrice } = req.body;
    console.log('[updateProductPrice] body:', req.body);
    console.log('[updateProductPrice] headers:', req.headers['content-type']);
    const update = {};
    if (price !== undefined && price !== '' && price !== null) update.price = Number(price);
    if (originalPrice !== undefined && originalPrice !== '' && originalPrice !== null) update.originalPrice = Number(originalPrice);
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'price or originalPrice is required', body: req.body });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update price' });
  }
};

// PATCH product stock (partial update)
export const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: 'Valid stock value is required' });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: Number(stock) },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update stock' });
  }
};

// POST bulk price update
export const bulkUpdatePrice = async (req, res) => {
  try {
    const { ids, mode, value } = req.body;
    if (!ids?.length || !mode || value === undefined) {
      return res.status(400).json({ error: 'ids, mode, and value are required' });
    }

    let ops;
    if (mode === 'increasePct') {
      ops = [{ $mul: { price: 1 + value / 100 } }];
    } else if (mode === 'decreasePct') {
      ops = [{ $mul: { price: 1 - value / 100 } }];
    } else if (mode === 'setPrice') {
      ops = [{ $set: { price: Number(value) } }];
    } else if (mode === 'setMrp') {
      ops = [{ $set: { originalPrice: Number(value) } }];
    } else {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    await Product.updateMany({ _id: { $in: ids } }, ops);
    const updated = await Product.find({ _id: { $in: ids } }).lean();
    res.json({ message: `Updated ${updated.length} products`, products: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Bulk update failed' });
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