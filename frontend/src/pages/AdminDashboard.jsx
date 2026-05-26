import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import AdminOrders from '../components/admin/AdminOrders';
import CategoryManagement from '../components/admin/CategoryManagement';
import { useAuth } from '../context/AuthContext';
import { playPendingOrderAlert } from '../utils/notificationSound';

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
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

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

  const fetchPendingOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      const pending = data.filter(o => o.orderStatus === 'Pending');
      setPendingOrders(pending);
      setPendingCount(pending.length);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') fetchPendingOrders();
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
        <h1 className="font-playfair text-3xl font-semibold text-navy">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-navy/5 p-1">
            <Link to="/admin/products" className={`px-4 py-2 font-medium transition text-sm uppercase tracking-widest inline-flex items-center bg-white shadow text-gold`}>
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Products
            </Link>
            <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 font-medium transition text-sm uppercase tracking-widest ${activeTab === 'categories' ? 'bg-white shadow text-gold' : 'text-navy/60 hover:text-navy'}`}>
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Categories
            </button>
            <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 font-medium transition text-sm uppercase tracking-widest relative ${activeTab === 'pending' ? 'bg-white shadow text-gold' : 'text-navy/60 hover:text-navy'}`}>
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Pending
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center">{pendingCount}</span>
              )}
            </button>
            <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 font-medium transition text-sm uppercase tracking-widest ${activeTab === 'orders' ? 'bg-white shadow text-gold' : 'text-navy/60 hover:text-navy'}`}>
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              All Orders
            </button>
            <button onClick={() => setActiveTab('admins')} className={`px-4 py-2 font-medium transition text-sm uppercase tracking-widest ${activeTab === 'admins' ? 'bg-white shadow text-gold' : 'text-navy/60 hover:text-navy'}`}>
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
              Admins
            </button>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition flex items-center gap-2 text-sm uppercase tracking-widest"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
      
      {activeTab === 'categories' ? (
        <CategoryManagement />
      ) : activeTab === 'orders' ? (
        <AdminOrders />
      ) : activeTab === 'pending' ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-playfair text-2xl font-semibold text-navy">Pending Orders ({pendingCount})</h2>
            <button onClick={fetchPendingOrders} className="text-sm text-gold hover:text-gold-dark font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
          </div>
          {pendingOrders.length === 0 ? (
            <div className="text-center py-16 border border-navy/10 bg-navy/[0.02]">
              <svg className="w-16 h-16 mx-auto text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="text-lg font-medium text-navy/60 mb-1">All caught up!</h3>
              <p className="text-sm text-navy/40">No pending orders</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pendingOrders.map(order => (
                <div key={order._id} className="bg-white border border-navy/10 hover:border-gold/30 transition">
                  <div className="p-4 border-b border-navy/5 bg-navy/[0.02]">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono text-xs text-navy/40">#{order._id?.slice(-8)}</p>
                        <p className="font-medium text-navy text-sm mt-0.5">{order.shippingAddress?.fullName}</p>
                      </div>
                      <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[10px] text-navy/40 uppercase tracking-wider mb-1">Items to Pack</p>
                      <div className="space-y-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-navy/80 truncate">{item.name}</span>
                            <span className="text-navy font-semibold ml-2 shrink-0">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-navy/5">
                      <p className="text-[10px] text-navy/40 uppercase tracking-wider mb-1">Customer</p>
                      <p className="text-sm text-navy/80">{order.shippingAddress?.phone}</p>
                      <p className="text-xs text-navy/50 mt-0.5">{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                    </div>
                    <div className="pt-2 border-t border-navy/5 flex justify-between items-center">
                      <span className="text-xs text-navy/40">Total</span>
                      <span className="font-semibold text-navy">Rs.{order.totalPrice?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto text-navy/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
          <h2 className="font-playfair text-2xl font-semibold text-navy mb-4">Admin Management</h2>
          <p className="text-navy/50">Manage admin users here</p>
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