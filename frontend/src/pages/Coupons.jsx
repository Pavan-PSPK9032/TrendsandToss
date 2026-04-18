import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Coupons() {
  const navigate = useNavigate()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [applyingCoupon, setApplyingCoupon] = useState(null)
  const [cartSubtotal, setCartSubtotal] = useState(0)

  useEffect(() => {
    fetchCoupons()
    fetchCartSubtotal()
  }, [])

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons/active')
      setCoupons(data)
    } catch (err) {
      console.error('Error fetching coupons:', err)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const fetchCartSubtotal = async () => {
    try {
      const { data } = await api.get('/cart')
      const subtotal = data.items.reduce((sum, item) => 
        sum + (item.productId?.price || 0) * item.quantity, 0
      )
      setCartSubtotal(subtotal)
    } catch (err) {
      console.error('Error fetching cart:', err)
    }
  }

  const applyCoupon = async (couponCode) => {
    if (cartSubtotal === 0) {
      toast.error('Your cart is empty. Add items to apply a coupon.')
      return
    }

    setApplyingCoupon(couponCode)
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode,
        orderValue: cartSubtotal
      })
      
      toast.success(`🎉 Coupon ${data.code} applied! You saved ₹${data.discountAmount.toFixed(2)}`)
      
      // Navigate to cart with coupon info
      navigate('/cart', { 
        state: { 
          appliedCoupon: {
            code: data.code,
            discountAmount: data.discountAmount,
            description: data.description
          }
        }
      })
    } catch (err) {
      console.error('Coupon error:', err)
      toast.error(err.response?.data?.error || 'Coupon cannot be applied')
    } finally {
      setApplyingCoupon(null)
    }
  }

  const isApplicable = (coupon) => {
    return cartSubtotal >= coupon.minOrderValue
  }

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`
    }
    return `₹${coupon.discountValue} OFF`
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mt-20 text-slate-500">Loading coupons...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-slate-900 mb-2 tracking-tight">Available Coupons</h1>
        <p className="text-slate-600">
          {cartSubtotal > 0 
            ? `Your cart subtotal: ₹${cartSubtotal.toFixed(2)} - Apply a coupon to save!` 
            : 'Add items to your cart to apply coupons'}
        </p>
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="text-center mt-20 p-10 bg-white rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xl text-slate-600 mb-6 font-light">No coupons available at the moment</p>
          <button 
            onClick={() => navigate('/')}
            className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition font-medium"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.map((coupon) => {
            const applicable = isApplicable(coupon)
            const maxDiscountText = coupon.maxDiscountAmount 
              ? ` (Max discount: ₹${coupon.maxDiscountAmount})` 
              : ''

            return (
              <div 
                key={coupon._id}
                className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                  applicable 
                    ? 'border-amber-400 hover:border-amber-500' 
                    : 'border-slate-200 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Coupon Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
                        {coupon.code}
                      </h3>
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {formatDiscount(coupon)}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 mb-2">{coupon.description}</p>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                      {coupon.minOrderValue > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                          Min. order: ₹{coupon.minOrderValue}
                        </span>
                      )}
                      {coupon.maxDiscountAmount && (
                        <span>Max discount: ₹{coupon.maxDiscountAmount}</span>
                      )}
                      {coupon.validUntil && (
                        <span>
                          Valid till: {new Date(coupon.validUntil).toLocaleDateString('en-IN')}
                        </span>
                      )}
                      {coupon.usageLimit && (
                        <span>
                          Uses left: {coupon.usageLimit - coupon.usedCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="sm:ml-4">
                    <button
                      onClick={() => applyCoupon(coupon.code)}
                      disabled={!applicable || applyingCoupon === coupon.code}
                      className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                        applicable
                          ? 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {applyingCoupon === coupon.code ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Applying...
                        </span>
                      ) : applicable ? (
                        'Apply Coupon'
                      ) : (
                        `Need ₹${(coupon.minOrderValue - cartSubtotal).toFixed(2)} more`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Back to Cart Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-2 bg-white border-2 border-slate-900 text-slate-900 px-8 py-3 rounded-xl hover:bg-slate-50 transition font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Cart
        </button>
      </div>
    </div>
  )
}
