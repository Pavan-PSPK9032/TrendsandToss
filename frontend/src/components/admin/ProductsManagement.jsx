import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageHelper';

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-sm p-6 shadow-xl">
        <h3 className="font-semibold text-navy text-lg mb-2">{title}</h3>
        <p className="text-navy/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white py-2.5 text-sm font-semibold uppercase tracking-widest hover:bg-red-700 transition">{confirmLabel || 'Delete'}</button>
          <button onClick={onCancel} className="flex-1 bg-navy/10 text-navy py-2.5 text-sm font-semibold uppercase tracking-widest hover:bg-navy/20 transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function PriceEditModal({ open, product, onSave, onClose }) {
  const [salePrice, setSalePrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setSalePrice(product.price || '');
      setMrp(product.originalPrice || '');
      setError('');
    }
  }, [product]);

  const discount = useMemo(() => {
    const sp = Number(salePrice);
    const mp = Number(mrp);
    if (sp > 0 && mp > sp) return Math.round(((mp - sp) / mp) * 100);
    return 0;
  }, [salePrice, mrp]);

  const handleSave = async () => {
    const sp = Number(salePrice);
    const mp = Number(mrp);
    if (!sp || sp <= 0) { setError('Selling price must be greater than 0'); return }
    if (mp && mp <= 0) { setError('MRP must be greater than 0'); return }
    if (mp && sp > mp) { setError('Selling price cannot be greater than MRP'); return }
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('price', sp);
      if (mp) fd.append('originalPrice', mp);
      await api.patch(`/products/${product._id}/price`, fd);
      toast.success('Price updated');
      onSave({ price: sp, originalPrice: mp });
      onClose();
    } catch (err) {
      toast.error('Failed to update price');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-sm p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-navy text-sm uppercase tracking-widest">Quick Price Edit</h3>
          <button onClick={onClose} className="text-navy/30 hover:text-navy transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-navy/60 text-xs mb-4 truncate">{product?.name}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-navy/60 mb-1.5 text-xs font-semibold uppercase tracking-wider">MRP (Rs.)</label>
            <input type="number" step="0.01" value={mrp} onChange={e => setMrp(e.target.value)}
              className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" placeholder="Before discount" />
          </div>
          <div>
            <label className="block text-navy/60 mb-1.5 text-xs font-semibold uppercase tracking-wider">Selling Price (Rs.) *</label>
            <input type="number" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)}
              className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" required />
          </div>

          {discount > 0 && (
            <div className="bg-green-50 border border-green-200 px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">Discount</span>
              <span className="text-sm font-bold text-green-700">{discount}% OFF</span>
            </div>
          )}

          {error && <p className="text-red-600 text-xs font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-navy text-white py-2.5 text-sm font-semibold uppercase tracking-widest hover:bg-navy-light disabled:opacity-40 transition">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose}
              className="px-6 py-2.5 border border-navy/20 text-navy text-sm font-semibold hover:bg-navy/5 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BulkActionBar({ selectedCount, onClear, onAction }) {
  const [mode, setMode] = useState('');
  const [value, setValue] = useState('');

  if (selectedCount === 0) return null;

  const handleApply = () => {
    const num = Number(value);
    if (!num || num <= 0) { toast.error('Enter a valid value'); return }
    if ((mode === 'increasePct' || mode === 'decreasePct') && num > 100) { toast.error('Percentage cannot exceed 100'); return }
    onAction(mode, num);
    setValue('');
    setMode('');
  };

  return (
    <div className="bg-navy/5 border border-navy/10 p-3 flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold text-navy/60 uppercase tracking-wider whitespace-nowrap">{selectedCount} selected</span>
      <button onClick={onClear} className="text-xs text-navy/40 hover:text-red-600 transition uppercase tracking-wider">Clear</button>
      <div className="h-5 w-px bg-navy/10" />
      <select value={mode} onChange={e => { setMode(e.target.value); setValue('') }}
        className="border border-navy/20 p-2 text-xs text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold">
        <option value="">Bulk action…</option>
        <option value="increasePct">Increase Sale Price by %</option>
        <option value="decreasePct">Decrease Sale Price by %</option>
        <option value="setPrice">Set Fixed Sale Price</option>
        <option value="setMrp">Set Fixed MRP</option>
      </select>
      {mode && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-navy/60">{mode === 'increasePct' || mode === 'decreasePct' ? '%' : 'Rs.'}</span>
          <input type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            className="w-20 border border-navy/20 p-2 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="0" autoFocus />
          <button onClick={handleApply}
            className="bg-navy text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-navy-light transition">Apply</button>
        </div>
      )}
    </div>
  );
}

export default function ProductsManagement() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', originalPrice: '', category: '', stock: '' });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [priceEditTarget, setPriceEditTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  // Open edit form for product ID passed via location state (from ProductCard pen icon)
  useEffect(() => {
    if (!loading && location.state?.editProductId) {
      const product = products.find(p => p._id === location.state.editProductId);
      if (product) {
        handleEdit(product);
        window.history.replaceState({}, document.title);
      }
    }
  }, [loading, location.state?.editProductId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products?limit=200');
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

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }
    return result;
  }, [products, searchQuery, categoryFilter]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) { toast.error('Maximum 3 images allowed'); return; }
    setImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('price', formData.price);
      if (formData.originalPrice) fd.append('originalPrice', formData.originalPrice);
      fd.append('category', formData.category);
      fd.append('stock', formData.stock);
      images.forEach(img => fd.append('images', img));

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
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
    setFormData({ name: product.name, description: product.description, price: product.price, originalPrice: product.originalPrice || '', category: product.category, stock: product.stock });
    setImagePreviews(product.images || []);
    setImages([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const updateStock = async (productId, newStock) => {
    const clamped = Math.max(0, newStock);
    setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: clamped } : p));
    try {
      const { data } = await api.patch(`/products/${productId}/stock`, { stock: clamped });
      setProducts(prev => prev.map(p => p._id === productId ? data : p));
    } catch (err) {
      toast.error('Failed to update stock');
      fetchProducts();
    }
  };

  const updatePrice = (productId, data) => {
    setProducts(prev => prev.map(p => p._id === productId ? { ...p, ...data } : p));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p._id));
    }
  };

  const handleBulkAction = async (mode, value) => {
    const ids = selectedIds;
    setSelectedIds([]);
    let updated = [...products];

    if (mode === 'increasePct') {
      updated = updated.map(p => ids.includes(p._id) ? { ...p, price: Math.round(p.price * (1 + value / 100) * 100) / 100 } : p);
    } else if (mode === 'decreasePct') {
      updated = updated.map(p => ids.includes(p._id) ? { ...p, price: Math.round(p.price * (1 - value / 100) * 100) / 100 } : p);
    } else if (mode === 'setPrice') {
      updated = updated.map(p => ids.includes(p._id) ? { ...p, price: value } : p);
    } else if (mode === 'setMrp') {
      updated = updated.map(p => ids.includes(p._id) ? { ...p, originalPrice: value } : p);
    }

    setProducts(updated);

    try {
      await api.post('/products/bulk-price', { ids, mode, value });
      toast.success(`Updated ${ids.length} products`);
    } catch (err) {
      toast.error('Bulk update failed');
      fetchProducts();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', originalPrice: '', category: '', stock: '' });
    setImages([]);
    setImagePreviews([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) return <div className="text-center py-20 text-navy/40 tracking-wide">Loading products...</div>;

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { handleDelete(confirmDelete); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-semibold text-navy">Product Management</h2>
          <p className="text-navy/50 text-sm mt-1">{filteredProducts.length} of {products.length} products</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-navy text-white px-6 py-2.5 hover:bg-navy-light transition font-medium text-sm uppercase tracking-widest flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Form */}
      <div className={`transition-all duration-300 overflow-hidden ${showForm ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white border border-navy/10 p-6">
          <h3 className="font-semibold text-navy text-sm uppercase tracking-widest mb-6">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Product Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" required />
              </div>
              <div>
                <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Category *</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" required>
                  <option value="">Select category</option>
                  {availableCategories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Description *</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm h-24" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Price (Rs.) *</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" required />
              </div>
              <div>
                <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">MRP (Rs.)</label>
                <input type="number" step="0.01" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" placeholder="Before discount" />
              </div>
              <div>
                <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Stock *</label>
                <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full border border-navy/20 p-3 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Images ({imagePreviews.length}/3)</label>
              <div className="border-2 border-dashed border-navy/20 p-6 text-center hover:border-gold transition cursor-pointer">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="product-image-upload" disabled={imagePreviews.length >= 3} />
                <label htmlFor="product-image-upload" className="cursor-pointer">
                  <svg className="w-8 h-8 mx-auto text-navy/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-gold hover:text-gold-dark font-medium text-sm">{imagePreviews.length >= 3 ? 'Maximum 3 images' : 'Click to upload images'}</span>
                </label>
              </div>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative group">
                      <img src={preview} alt="" className="w-full h-28 object-cover border border-navy/10" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={uploading} className="flex-1 bg-gold text-white py-3 hover:bg-gold-dark disabled:opacity-40 font-medium text-sm uppercase tracking-widest transition">
                {uploading ? 'Uploading...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={resetForm} className="px-8 py-3 border border-navy/20 text-navy hover:bg-navy/5 text-sm font-medium transition">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full sm:w-48 border border-navy/20 p-2.5 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm">
          <option value="">All Categories</option>
          {availableCategories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
        </select>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onClear={() => setSelectedIds([])} onAction={handleBulkAction} />

      {/* Products Grid (mobile) / Table (desktop) */}
      <div className="bg-white border border-navy/10 overflow-hidden">
        {/* Mobile card view */}
        <div className="block lg:hidden divide-y divide-navy/5">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-navy/40">
              <svg className="w-12 h-12 mx-auto mb-3 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <p className="text-lg">No products found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : filteredProducts.map(product => {
            const discount = product.originalPrice && product.originalPrice > product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
            return (
            <div key={product._id} className="p-4 hover:bg-navy/[0.02] transition">
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-1">
                  <input type="checkbox" checked={selectedIds.includes(product._id)} onChange={() => toggleSelect(product._id)}
                    className="w-4 h-4 accent-navy cursor-pointer" />
                  <img src={getImageUrl(product.images?.[0])} alt={product.name} className="w-12 h-12 object-cover border border-navy/10 flex-shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy text-sm truncate">{product.name}</div>
                  <div className="text-xs text-navy/50 capitalize mt-0.5">{product.category}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-navy text-sm">Rs.{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-navy/30 line-through">Rs.{product.originalPrice}</span>
                      )}
                    </div>
                    {discount > 0 && (
                      <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5">{discount}% OFF</span>
                    )}
                    <button onClick={() => setPriceEditTarget(product)} className="ml-auto p-1 text-navy/30 hover:text-gold transition" title="Quick price edit">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center border border-navy/15 bg-white">
                      <button onClick={() => updateStock(product._id, product.stock - 1)} disabled={product.stock <= 0}
                        className="w-6 h-6 flex items-center justify-center text-navy/50 hover:text-white hover:bg-navy transition disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                      </button>
                      <span className="w-7 text-center text-xs font-semibold text-navy tabular-nums leading-none">{product.stock}</span>
                      <button onClick={() => updateStock(product._id, product.stock + 1)}
                        className="w-6 h-6 flex items-center justify-center text-navy/50 hover:text-white hover:bg-navy transition">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                    <button onClick={() => handleEdit(product)} className="p-1.5 text-gold hover:text-gold-dark transition" title="Edit">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => setConfirmDelete(product._id)} className="p-1.5 text-red-500 hover:text-red-700 transition" title="Delete">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Desktop table view */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy/10 bg-navy/5">
                <th className="p-4 w-10">
                  <input type="checkbox" checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll} className="w-4 h-4 accent-navy cursor-pointer" />
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Product</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Category</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Price</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Stock</th>
                <th className="p-4 text-right text-xs font-semibold uppercase tracking-widest text-navy/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4">
                    <div className="text-center py-12 text-navy/40">
                      <svg className="w-10 h-10 mx-auto mb-3 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      <p className="text-lg">No products found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.map(product => {
                const discount = product.originalPrice && product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
                return (
                <tr key={product._id} className="hover:bg-navy/[0.02] transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" checked={selectedIds.includes(product._id)} onChange={() => toggleSelect(product._id)}
                      className="w-4 h-4 accent-navy cursor-pointer" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 flex-shrink-0 overflow-hidden border border-navy/5">
                        <img src={getImageUrl(product.images?.[0])} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div>
                        <div className="font-medium text-navy text-sm">{product.name}</div>
                        <div className="text-xs text-navy/40 truncate max-w-[200px] mt-0.5">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="text-xs font-medium text-navy/60 bg-navy/5 px-2.5 py-1 capitalize">{product.category}</span></td>
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-navy text-sm">Rs.{product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-navy/30 line-through">MRP Rs.{product.originalPrice}</span>
                        )}
                        {discount > 0 && (
                          <span className="text-xs font-bold text-green-600 mt-0.5">{discount}% OFF</span>
                        )}
                      </div>
                      <button onClick={() => setPriceEditTarget(product)} className="opacity-0 group-hover:opacity-100 p-0.5 text-navy/30 hover:text-gold transition mt-0.5" title="Quick price edit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 border ${
                      product.stock > 10 ? 'bg-green-50 text-green-700 border-green-200' :
                      product.stock > 3 ? 'bg-gold/10 text-gold border-gold/30' :
                      product.stock > 0 ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        product.stock > 10 ? 'bg-green-500' :
                        product.stock > 3 ? 'bg-gold' :
                        product.stock > 0 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}></span>
                      {product.stock > 10 ? 'In Stock' : product.stock > 3 ? `${product.stock} in stock` : product.stock > 0 ? `Low Stock (${product.stock})` : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="flex items-center border border-navy/15 bg-white mr-1">
                        <button onClick={() => updateStock(product._id, product.stock - 1)} disabled={product.stock <= 0}
                          className="w-7 h-7 flex items-center justify-center text-navy/50 hover:text-white hover:bg-navy transition disabled:opacity-30 disabled:cursor-not-allowed">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                        </button>
                        <span className="w-9 text-center text-xs font-semibold text-navy tabular-nums leading-none">{product.stock}</span>
                        <button onClick={() => updateStock(product._id, product.stock + 1)}
                          className="w-7 h-7 flex items-center justify-center text-navy/50 hover:text-white hover:bg-navy transition">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                      <button onClick={() => handleEdit(product)} className="p-2 text-navy/40 hover:text-gold hover:bg-gold/5 transition rounded-none" title="Edit product">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => setConfirmDelete(product._id)} className="p-2 text-navy/40 hover:text-red-600 hover:bg-red-50 transition rounded-none" title="Delete product">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PriceEditModal
        open={!!priceEditTarget}
        product={priceEditTarget}
        onSave={(data) => { updatePrice(priceEditTarget?._id, data); }}
        onClose={() => setPriceEditTarget(null)}
      />
    </div>
  );
}
