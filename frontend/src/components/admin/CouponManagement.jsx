import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderValue: 0,
  maxDiscountAmount: '',
  usageLimit: '',
  validUntil: '',
  isActive: true,
  isFeatured: false
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => { fetchCoupons() }, [])

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons')
      setCoupons(data)
    } catch { toast.error('Failed to load coupons') }
    finally { setLoading(false) }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const openCreate = () => {
    setForm({ ...emptyForm })
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      usageLimit: coupon.usageLimit || '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
      isFeatured: coupon.isFeatured || false
    })
    setEditing(coupon._id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderValue: Number(form.minOrderValue),
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      validUntil: form.validUntil ? new Date(form.validUntil) : undefined
    }
    try {
      if (editing) {
        await api.put(`/coupons/${editing}`, payload)
        toast.success('Coupon updated')
      } else {
        await api.post('/coupons', payload)
        toast.success('Coupon created')
      }
      setShowForm(false)
      setEditing(null)
      fetchCoupons()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save coupon')
    }
  }

  const toggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive })
      toast.success(`Coupon ${coupon.isActive ? 'disabled' : 'enabled'}`)
      fetchCoupons()
    } catch { toast.error('Failed to update') }
  }

  const toggleFeatured = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isFeatured: !coupon.isFeatured })
      toast.success(coupon.isFeatured ? 'Removed from featured' : 'Marked as featured')
      fetchCoupons()
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return
    try {
      await api.delete(`/coupons/${id}`)
      toast.success('Coupon deleted')
      fetchCoupons()
    } catch { toast.error('Failed to delete') }
  }

  const formatDiscount = (c) => c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`
  const isExpired = (c) => c.validUntil && new Date(c.validUntil) < new Date()
  const isExhausted = (c) => c.usageLimit && c.usedCount >= c.usageLimit

  if (loading) return <div className="text-center py-20 text-navy/40">Loading coupons...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-playfair text-2xl font-semibold text-navy">Coupon Management</h2>
        <button onClick={openCreate} className="bg-gold text-white px-5 py-2 font-medium text-sm uppercase tracking-widest hover:bg-gold-dark transition flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Coupons', value: coupons.length, color: 'text-navy' },
          { label: 'Active', value: coupons.filter(c => c.isActive && !isExpired(c)).length, color: 'text-green-600' },
          { label: 'Featured', value: coupons.filter(c => c.isFeatured).length, color: 'text-gold' },
          { label: 'Total Used', value: coupons.reduce((s, c) => s + c.usedCount, 0), color: 'text-navy' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-navy/10 p-4">
            <p className="text-xs text-navy/40 uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-playfair text-xl font-semibold text-navy">{editing ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button onClick={() => setShowForm(false)} className="text-navy/40 hover:text-navy"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-semibold uppercase tracking-wider text-navy/60 mb-1">Code</label><input name="code" value={form.code} onChange={handleChange} required className="w-full p-3 text-sm border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none uppercase" placeholder="WELCOME10" /></div>
              <div><label className="block text-xs font-semibold uppercase tracking-wider text-navy/60 mb-1">Description</label><input name="description" value={form.description} onChange={handleChange} required className="w-full p-3 text-sm border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none" placeholder="Get 10% off on your first order" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-navy/60 mb-1">Discount Type</label><select name="discountType" value={form.discountType} onChange={handleChange} className="w-full p-3 text-sm border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none"><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-navy/60 mb-1">Discount Value</label><input name="discountValue" type="number" step="0.01" value={form.discountValue} onChange={handleChange} required className="w-full p-3 text-sm border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none" placeholder="10" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-navy/60 mb-1">Min Order Value</label><input name="minOrderValue" type="number" value={form.minOrderValue} onChange={handleChange} className="w-full p-3 text-sm border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none" placeholder="0" /></div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-navy/60 mb-1">Max Discount (for %)</label><input name="maxDiscountAmount" type="number" value={form.maxDiscountAmount} onChange={handleChange} className="w-full p-3 text-sm border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none" placeholder="Unlimited" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-navy/60 mb-1">Usage Limit</label><input name="usageLimit" type="number" value={form.usageLimit} onChange={handleChange} className="w-full p-3 text-sm border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none" placeholder="Unlimited" /></div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-navy/60 mb-1">Valid Until</label><input name="validUntil" type="date" value={form.validUntil} onChange={handleChange} className="w-full p-3 text-sm border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none" /></div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4" /><span className="text-sm text-navy">Active</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4" /><span className="text-sm text-navy">Featured</span></label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gold text-white py-3 font-medium text-sm uppercase tracking-widest hover:bg-gold-dark transition">{editing ? 'Update' : 'Create'} Coupon</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 border border-navy/20 text-navy text-sm hover:bg-navy/5 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon List */}
      <div className="space-y-3">
        {coupons.length === 0 ? (
          <div className="text-center py-16 border border-navy/10 bg-navy/[0.02]">
            <p className="text-navy/40 text-lg font-light">No coupons yet. Create your first coupon!</p>
          </div>
        ) : coupons.map(coupon => (
          <div key={coupon._id} className={`bg-white border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${!coupon.isActive ? 'opacity-50' : ''}`}
            style={{ borderColor: coupon.isFeatured ? '#D4AF37' : 'var(--border)' }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-lg text-navy tracking-wide">{coupon.code}</span>
                <span className="bg-gold/10 text-gold px-2 py-0.5 text-xs font-semibold">{formatDiscount(coupon)}</span>
                {coupon.isFeatured && <span className="bg-gold text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Featured</span>}
                {isExpired(coupon) && <span className="bg-red-100 text-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Expired</span>}
                {isExhausted(coupon) && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Exhausted</span>}
              </div>
              <p className="text-sm text-navy/60 mb-1">{coupon.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-navy/40">
                {coupon.minOrderValue > 0 && <span>Min: ₹{coupon.minOrderValue}</span>}
                {coupon.maxDiscountAmount && <span>Max: ₹{coupon.maxDiscountAmount}</span>}
                {coupon.usageLimit && <span>Used: {coupon.usedCount}/{coupon.usageLimit}</span>}
                {coupon.validUntil && <span>Valid till: {new Date(coupon.validUntil).toLocaleDateString('en-IN')}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleFeatured(coupon)} className={`px-3 py-1.5 text-xs font-medium border transition ${coupon.isFeatured ? 'bg-gold text-white border-gold' : 'border-navy/20 text-navy/60 hover:border-gold'}`} title={coupon.isFeatured ? 'Remove featured' : 'Mark featured'}>
                <svg className="w-4 h-4" fill={coupon.isFeatured ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </button>
              <button onClick={() => toggleActive(coupon)} className={`px-3 py-1.5 text-xs font-medium border transition ${coupon.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'border-navy/20 text-navy/40'}`}>
                {coupon.isActive ? 'Active' : 'Disabled'}
              </button>
              <button onClick={() => openEdit(coupon)} className="px-3 py-1.5 text-xs font-medium border border-navy/20 text-navy/60 hover:bg-navy/5 transition">Edit</button>
              <button onClick={() => handleDelete(coupon._id)} className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
