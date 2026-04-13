import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import AdminOrders from '../components/admin/AdminOrders';
import CategoryManagement from '../components/admin/CategoryManagement';
import ProductsManagement from '../components/admin/ProductsManagement';
import { getImageUrl } from '../utils/imageHelper';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
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
  const [availableCategories, setAvailableCategories] = useState([]);
  
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
      fetchCategories();
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
    // Check if user exists and is admin
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required. Please login again.');
      navigate('/login');
      return false;
    }
    
    return true;
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
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
            <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'categories' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              🏷️ Categories
            </button>
            <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'orders' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              📋 Orders
            </button>
            <button onClick={() => setActiveTab('admins')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'admins' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              👥 Admins
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
        <ProductsManagement />
      ) : activeTab === 'categories' ? (
        <CategoryManagement />
      ) : activeTab === 'orders' ? (
        <AdminOrders />
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Admin Management</h2>
          <p className="text-slate-600">Manage admin users here</p>
        </div>
      )}
      
      {activeTab === 'categories' && (
        <div>
          <CategoryManagement />
        </div>
      )}
    </div>
  );
}