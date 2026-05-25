import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageHelper';
import { useAuth } from '../../context/AuthContext';

export default function ProductsManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    checkAdmin();
    fetchProducts();
    fetchCategories();
  }, []);

  const checkAdmin = () => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/login');
      return false;
    }
    return true;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products');
      setProducts(data.products);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setAvailableCategories(data.categories);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };



  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      if (formData.originalPrice) {
        formDataToSend.append('originalPrice', formData.originalPrice);
      }
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      images.forEach(image => formDataToSend.append('images', image));

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product added successfully!');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category,
      stock: product.stock
    });
    setImagePreviews(product.images || []);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Are you sure you want to DELETE ALL ${products.length} products? This cannot be undone!`)) return;
    if (!window.confirm('Final confirmation: This will permanently delete ALL products!')) return;
    try {
      await api.delete('/products/all');
      toast.success('All products deleted successfully!');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete all products');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', originalPrice: '', category: '', stock: '' });
    setImages([]);
    setImagePreviews([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) return <div className="text-center mt-20 text-navy/40 tracking-wide">Loading products...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-semibold text-navy">Products Management</h1>
          <p className="text-navy/50 text-sm mt-1">Total: {products.length} products</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-navy text-white px-6 py-3 hover:bg-navy-light font-medium text-sm uppercase tracking-widest"
          >
            {showForm ? 'Cancel' : '+ Add New Product'}
          </button>
          {products.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="bg-red-600 text-white px-6 py-3 hover:bg-red-700 font-medium text-sm uppercase tracking-widest"
            >
              Delete All Products
            </button>
          )}
        </div>
      </div>

      {/* Products count */}
      <div className="text-right mb-4 text-sm text-navy/50">
        Showing all {products.length} products
      </div>

      {showForm && (
        <div className="bg-white border border-navy/10 p-6 mb-8">
          <h2 className="font-semibold text-navy text-sm uppercase tracking-widest mb-6">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Product Name *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Description *</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm h-24" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Selling Price (Rs.) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">MRP (Rs.)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.originalPrice} 
                  onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} 
                  className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" 
                  placeholder="Original price before discount"
                />
              </div>
              <div>
                <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Stock *</label>
                <input 
                  type="number" 
                  value={formData.stock} 
                  onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                  className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Category *</label>
              <select 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm"
                required
              >
                <option value="">Select a category</option>
                {availableCategories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Product Images ({imagePreviews.length}/3)</label>
              <div className="border-2 border-dashed border-navy/20 p-6 text-center hover:border-gold transition">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                  id="image-upload" 
                  disabled={imagePreviews.length >= 3} 
                />
                <label htmlFor="image-upload" className="cursor-pointer text-gold hover:text-gold-dark font-medium text-sm">
                  {imagePreviews.length >= 3 ? 'Maximum 3 images reached' : 'Click to upload images'}
                </label>
              </div>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover border border-navy/10" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)} 
                        className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                disabled={uploading} 
                className="flex-1 bg-gold text-white py-3 hover:bg-gold-dark disabled:opacity-40 font-medium text-sm uppercase tracking-widest"
              >
                {uploading ? 'Uploading...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button 
                type="button" 
                onClick={resetForm} 
                className="flex-1 bg-navy/10 text-navy py-3 hover:bg-navy/20 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-navy/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy/5">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Product</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Category</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Price</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Stock</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="border-t border-navy/5 hover:bg-navy/[0.02] transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={getImageUrl(product.images?.[0])} alt={product.name} className="w-16 h-16 object-cover border border-navy/10" />
                      <div>
                        <div className="font-medium text-navy">{product.name}</div>
                        <div className="text-sm text-navy/50 truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize text-navy/60 text-sm">{product.category}</td>
                  <td className="p-4 font-semibold text-navy">Rs.{product.price}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-sm font-medium border ${
                      product.stock > 10 ? 'bg-gold/10 text-gold border-gold/30' : 
                      product.stock > 0 ? 'bg-gold/10 text-gold border-gold/30' : 
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleEdit(product)} 
                      className="text-gold hover:text-gold-dark mr-3 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)} 
                      className="text-red-500 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-16 text-navy/40">
            <p className="text-xl">No products found</p>
            <p className="text-sm mt-2">Click "Add New Product" to create one</p>
          </div>
        )}
      </div>

    </div>
  );
}
