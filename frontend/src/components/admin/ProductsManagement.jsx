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
    category: '',
    stock: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 10;

  useEffect(() => {
    checkAdmin();
    fetchProducts();
    fetchCategories();
  }, [currentPage]);

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
      setTotalProducts(data.products.length);
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

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(totalProducts / productsPerPage);

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

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: '', stock: '' });
    setImages([]);
    setImagePreviews([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  // Pagination controls
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="text-center mt-20">Loading products...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products Management</h1>
          <p className="text-slate-600 mt-1">Total: {totalProducts} products</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg"
        >
          {showForm ? '✕ Cancel' : '+ Add New Product'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-700 mb-2 font-medium">Product Name *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-slate-700 mb-2 font-medium">Description *</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="w-full border border-slate-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 mb-2 font-medium">Price (₹) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-2 font-medium">Stock *</label>
                <input 
                  type="number" 
                  value={formData.stock} 
                  onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-2 font-medium">Category *</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {availableCategories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-2 font-medium">Product Images ({imagePreviews.length}/3)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                  id="image-upload" 
                  disabled={imagePreviews.length >= 3} 
                />
                <label htmlFor="image-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                  {imagePreviews.length >= 3 ? 'Maximum 3 images reached' : '📷 Click to upload images'}
                </label>
              </div>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)} 
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
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
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 font-medium shadow-lg"
              >
                {uploading ? '⏳ Uploading...' : editingProduct ? '💾 Update Product' : '➕ Add Product'}
              </button>
              <button 
                type="button" 
                onClick={resetForm} 
                className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="p-4 text-left font-semibold text-slate-700">Product</th>
                <th className="p-4 text-left font-semibold text-slate-700">Category</th>
                <th className="p-4 text-left font-semibold text-slate-700">Price</th>
                <th className="p-4 text-left font-semibold text-slate-700">Stock</th>
                <th className="p-4 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map(product => (
                <tr key={product._id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={getImageUrl(product.images?.[0])} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div>
                        <div className="font-semibold text-slate-900">{product.name}</div>
                        <div className="text-sm text-slate-500 truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize text-slate-700">{product.category}</td>
                  <td className="p-4 font-semibold text-slate-900">₹{product.price}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' : 
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleEdit(product)} 
                      className="text-blue-600 hover:text-blue-800 mr-3 font-medium hover:underline"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)} 
                      className="text-red-600 hover:text-red-800 font-medium hover:underline"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {currentProducts.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl">No products found</p>
            <p className="text-sm mt-2">Click "Add New Product" to create one</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            ← Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => paginate(page)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                currentPage === page
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Next →
          </button>
        </div>
      )}

      {/* Page Info */}
      <div className="text-center mt-4 text-sm text-slate-600">
        Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, totalProducts)} of {totalProducts} products
      </div>
    </div>
  );
}
