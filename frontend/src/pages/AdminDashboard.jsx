import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import AdminOrders from '../components/admin/AdminOrders';
import { getImageUrl } from '../utils/imageHelper';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'electronics',
    stock: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Admin management state
  const [admins, setAdmins] = useState([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    checkAdmin();
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'admins') {
      fetchAdmins();
    }
    
    // Set up session timeout
    const sessionTimer = setTimeout(() => {
      toast.error('Session expired. Please login again.');
      handleLogout();
    }, SESSION_TIMEOUT);
    
    // Clean up timer on unmount
    return () => clearTimeout(sessionTimer);
  }, [activeTab]);

  const checkAdmin = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const adminSession = localStorage.getItem('adminSession');
    
    // Check if admin session exists and is still valid
    if (!adminSession || !user || user.role !== 'admin') {
      toast.error('Admin access required. Please login again.');
      navigate('/login');
      return false;
    }
    
    // Check if session has expired
    const sessionTime = parseInt(adminSession);
    const now = Date.now();
    if (now - sessionTime > SESSION_TIMEOUT) {
      toast.error('Session expired. Please login again.');
      handleLogout();
      return false;
    }
    
    return true;
  };

  const handleLogout = () => {
    // Clear admin session
    localStorage.removeItem('adminSession');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
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
    setFormData({ name: '', description: '', price: '', category: 'electronics', stock: '' });
    setImages([]);
    setImagePreviews([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  // Admin management functions
  const fetchAdmins = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setAdmins(data.filter(user => user.role === 'admin'));
    } catch (err) {
      toast.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', {
        ...adminFormData,
        role: 'admin'
      });
      toast.success('New admin created successfully!');
      setAdminFormData({ name: '', email: '', password: '' });
      setShowAdminForm(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create admin');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.id === adminId) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this admin?')) return;
    try {
      await api.delete(`/admin/users/${adminId}`);
      toast.success('Admin removed successfully!');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove admin');
    }
  };

  const resetAdminForm = () => {
    setAdminFormData({ name: '', email: '', password: '' });
    setShowAdminForm(false);
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'products' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              📦 Products
            </button>
            <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'orders' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              Orders
            </button>
            <button onClick={() => setActiveTab('admins')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'admins' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              Admins
            </button>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
      
      {activeTab === 'products' ? (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Products Management</h2>
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              {showForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Product Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2" required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Description *</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2 h-24" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Price ($) *</label>
                    <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border rounded-lg p-2" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Stock *</label>
                    <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full border rounded-lg p-2" required />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border rounded-lg p-2">
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="accessories">Accessories</option>
                    <option value="home">Home & Living</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Product Images ({imagePreviews.length}/3)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" disabled={imagePreviews.length >= 3} />
                    <label htmlFor="image-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                      {imagePreviews.length >= 3 ? 'Maximum 3 images reached' : 'Click to upload images'}
                    </label>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <button type="submit" disabled={uploading} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                    {uploading ? 'Uploading...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button type="button" onClick={resetForm} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Stock</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={getImageUrl(product.images?.[0])} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize">{product.category}</td>
                    <td className="p-4 font-semibold">${product.price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.stock}</span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <div className="text-center py-12 text-gray-500">No products found. Click "Add Product" to create one.</div>}
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        <AdminOrders />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Admin Management</h2>
            <button onClick={() => setShowAdminForm(!showAdminForm)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              {showAdminForm ? 'Cancel' : '+ Create Admin'}
            </button>
          </div>

          {showAdminForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Create New Admin</h2>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name *</label>
                  <input type="text" value={adminFormData.name} onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})} className="w-full border rounded-lg p-2" required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email *</label>
                  <input type="email" value={adminFormData.email} onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})} className="w-full border rounded-lg p-2" required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Password *</label>
                  <input type="password" value={adminFormData.password} onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})} className="w-full border rounded-lg p-2" required minLength="6" />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
                    Create Admin
                  </button>
                  <button type="button" onClick={resetAdminForm} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Created</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin._id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-semibold">{admin.name}</td>
                    <td className="p-4">{admin.email}</td>
                    <td className="p-4">{new Date(admin.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button onClick={() => handleDeleteAdmin(admin._id)} className="text-red-600 hover:text-red-800">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {admins.length === 0 && <div className="text-center py-12 text-gray-500">No admins found.</div>}
          </div>
        </div>
      )}
    </div>
  );
}