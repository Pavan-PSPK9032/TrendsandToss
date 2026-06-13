import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import AdminOrders from '../components/admin/AdminOrders';
import CategoryManagement from '../components/admin/CategoryManagement';
import CouponManagement from '../components/admin/CouponManagement';
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
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingFilter, setPendingFilter] = useState('Pending');
  const [packingOrderId, setPackingOrderId] = useState(null);

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

  const [productStockMap, setProductStockMap] = useState({});

  const fetchPendingOrders = async (playSound = false) => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products?limit=200')
      ]);
      const data = ordersRes.data;
      const products = productsRes.data.products || [];
      const stockMap = {};
      products.forEach(p => { stockMap[p._id] = p.stock; });
      setProductStockMap(stockMap);

      const pending = data.filter(o => o.orderStatus === 'Pending');
      const filtered = pendingFilter === 'all'
        ? data.filter(o => ['Pending', 'Packed'].includes(o.orderStatus))
        : data.filter(o => o.orderStatus === pendingFilter);
      setPendingOrders(filtered);
      setPendingCount(pending.length);
      if (playSound && pending.length > 0) {
        playPendingOrderAlert();
        toast(`${pending.length} pending order${pending.length > 1 ? 's' : ''} need attention`, { icon: '🔔', duration: 5000 });
      }
    } catch {
      // silently fail
    }
  };

  const markAsPacked = async (orderId) => {
    setPackingOrderId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'Packed', trackingNote: 'Order packed and ready for shipping' });
      toast.success('Order marked as packed');
      fetchPendingOrders();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setPackingOrderId(null);
    }
  };

  const printPackingSlip = (order) => {
    const win = window.open('', '_blank');
    const itemsRows = order.items.map(item =>
      `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:10px">
        ${item.image ? `<img src="${item.image}" style="width:40px;height:40px;object-fit:cover;border-radius:4px" />` : ''}
        <span>${item.name}</span></td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center;font-weight:bold">x${item.quantity}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">Rs.${(item.price * item.quantity).toFixed(2)}</td></tr>`
    ).join('');
    win.document.write(`
      <html><head><title>Packing Slip #${order._id?.slice(-8)}</title>
      <style>body{font-family:Arial,sans-serif;padding:30px;max-width:700px;margin:0 auto}
      h1{font-size:20px;color:#001F5B;border-bottom:2px solid #C9A84C;padding-bottom:8px}
      table{width:100%;border-collapse:collapse;margin-top:15px}
      th{text-align:left;padding:8px 10px;background:#f5f5f5;font-size:12px;text-transform:uppercase}
      .address{background:#fafafa;padding:12px;margin-top:10px;font-size:13px;line-height:1.6}
      .total{text-align:right;font-size:18px;font-weight:bold;margin-top:15px;padding-top:10px;border-top:2px solid #C9A84C}
      .footer{text-align:center;margin-top:30px;font-size:11px;color:#999}
      </style></head><body>
      <h1>Packing Slip</h1>
      <p style="display:flex;justify-content:space-between;font-size:13px;color:#666">
        <span>Order: <strong>#${order._id?.slice(-8)}</strong></span>
        <span>Date: <strong>${new Date(order.createdAt).toLocaleDateString()}</strong></span>
      </p>
      <div class="address">
        <strong>${order.shippingAddress?.fullName}</strong><br/>
        ${order.shippingAddress?.phone}<br/>
        ${order.shippingAddress?.address}<br/>
        ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}
      </div>
      <table><thead><tr><th style="width:60%">Item</th><th style="width:15%;text-align:center">Qty</th><th style="width:25%;text-align:right">Amount</th></tr></thead>
      <tbody>${itemsRows}</tbody></table>
      <div class="total">Total: Rs.${order.totalPrice?.toFixed(2)}</div>
      <div class="footer">Trends & Toss - Packing Slip</div>
      <script>window.print()</script>
      </body></html>`);
    win.document.close();
  };

  useEffect(() => {
    fetchPendingOrders(true);
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') fetchPendingOrders();
  }, [activeTab, pendingFilter]);

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
            <button onClick={() => setActiveTab('coupons')} className={`px-4 py-2 font-medium transition text-sm uppercase tracking-widest ${activeTab === 'coupons' ? 'bg-white shadow text-gold' : 'text-navy/60 hover:text-navy'}`}>
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              Coupons
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
          <div className="sticky top-0 z-10 bg-white pb-4 -mx-4 px-4 border-b border-navy/10 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-playfair text-2xl font-semibold text-navy">Pending Orders</h2>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1">{pendingCount} pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Search orders..." value={pendingSearch} onChange={(e) => setPendingSearch(e.target.value)} className="pl-9 pr-3 py-2 text-sm border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none w-48" />
                </div>
                <select value={pendingFilter} onChange={(e) => setPendingFilter(e.target.value)} className="p-2 text-sm border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none">
                  <option value="Pending">Pending</option>
                  <option value="Packed">Packed</option>
                  <option value="all">All</option>
                </select>
                <button onClick={fetchPendingOrders} className="p-2 border border-navy/20 hover:bg-navy/5 transition">
                  <svg className="w-4 h-4 text-navy/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>
            </div>
          </div>

          {(() => {
            const searched = pendingOrders.filter(o =>
              !pendingSearch || o._id?.toLowerCase().includes(pendingSearch.toLowerCase()) ||
              o.shippingAddress?.fullName?.toLowerCase().includes(pendingSearch.toLowerCase()) ||
              o.shippingAddress?.phone?.includes(pendingSearch)
            );
            if (searched.length === 0) {
              return (
                <div className="text-center py-16 border border-navy/10 bg-navy/[0.02]">
                  <svg className="w-16 h-16 mx-auto text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3 className="text-lg font-medium text-navy/60 mb-1">All caught up!</h3>
                  <p className="text-sm text-navy/40">{pendingSearch ? 'No orders match your search' : 'No pending orders'}</p>
                </div>
              );
            }
            return (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {searched.map(order => (
                  <div key={order._id} className="bg-white border border-navy/10 hover:shadow-lg hover:border-gold/30 transition-all duration-200">
                    {/* Card Header */}
                    <div className="p-4 border-b border-navy/5 bg-navy/[0.02] flex justify-between items-start">
                      <div>
                        <p className="font-mono text-xs text-navy/40">#{order._id?.slice(-8)}</p>
                        <p className="font-medium text-navy mt-0.5">{order.shippingAddress?.fullName}</p>
                      </div>
                      <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 font-medium whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Items to Pack */}
                    <div className="p-4">
                      <p className="text-[10px] text-navy/40 uppercase tracking-wider mb-2 font-semibold">Items to Pack</p>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 hover:bg-gold/[0.04] transition-colors border border-transparent hover:border-gold/20">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover border border-navy/10 shrink-0" onError={(e) => { e.target.style.display = 'none' }} />
                            ) : (
                              <div className="w-12 h-12 bg-navy/5 flex items-center justify-center shrink-0 border border-navy/10">
                                <svg className="w-6 h-6 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-navy/80 font-medium truncate">{item.name}</p>
                              {productStockMap[item.productId] === 0 && (
                                <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 leading-none">Last Piece Sold</span>
                              )}
                            </div>
                            <span className="text-navy font-bold text-sm shrink-0 bg-white px-2 py-0.5 border border-navy/10">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="px-4 pb-2">
                      <div className="p-3 bg-navy/[0.02] border border-navy/5">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-3.5 h-3.5 text-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          <span className="text-xs text-navy/70 font-medium">{order.shippingAddress?.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-3.5 h-3.5 text-navy/30 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <p className="text-xs text-navy/50 leading-relaxed">{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-4 space-y-2">
                      <div className="flex justify-between items-center pt-2 border-t border-navy/5">
                        <span className="text-xs text-navy/40 uppercase tracking-wider">Total</span>
                        <span className="font-bold text-navy text-base">Rs.{order.totalPrice?.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => printPackingSlip(order)} className="flex-1 border border-navy/20 text-navy text-xs font-medium py-2 hover:bg-navy/5 transition flex items-center justify-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                          Print Slip
                        </button>
                        <button onClick={() => markAsPacked(order._id)} disabled={packingOrderId === order._id || order.orderStatus === 'Packed'} className="flex-1 bg-gold text-white text-xs font-semibold py-2 hover:bg-gold-dark transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                          {packingOrderId === order._id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin"></div>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          )}
                          {order.orderStatus === 'Packed' ? 'Packed' : 'Mark Packed'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
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
      {activeTab === 'coupons' && (
        <CouponManagement />
      )}
    </div>
  );
}