import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import ImageCarousel from '../components/ImageCarousel'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function Cart() {
  const navigate = useNavigate()
  const location = useLocation()
  const { removeFromCart, updateCartUI } = useCart()
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [couponInfo, setCouponInfo] = useState(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  useEffect(() => {
    if (location.state?.appliedCoupon) {
      const { appliedCoupon } = location.state
      setCouponInfo({
        code: appliedCoupon.code,
        discountAmount: appliedCoupon.discountAmount,
        description: appliedCoupon.description
      })
      toast.success(`Coupon ${appliedCoupon.code} applied!`)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart')
      setCart(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cart.items.reduce((sum, item) => 
    sum + (item.productId?.price || 0) * item.quantity, 0
  )

  const hasOutOfStock = cart.items.some(item => item.productId?.stock === 0)

  const discountAmount = couponInfo?.discountAmount || 0
  const total = subtotal - discountAmount

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }
    setApplyingCoupon(true)
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode,
        orderValue: subtotal
      })
      setCouponInfo(data)
      toast.success(`Coupon applied! You saved Rs.${data.discountAmount.toFixed(2)}`)
    } catch (err) {
      setCouponInfo(null)
      toast.error(err.response?.data?.error || 'Invalid coupon code')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setCouponInfo(null)
  }

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId)
      await updateCartUI()
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.productId?._id !== productId)
      }))
      toast.success('Item removed from cart')
    } catch (err) {
      toast.error('Failed to remove item')
    }
  }

  if (loading) return (
    <div className="text-center mt-20" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
      Loading cart...
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="font-heading text-3xl font-semibold mb-8 tracking-tight" style={{ color: 'var(--theme-text)' }}>
        Shopping Bag
      </h1>
      
      {cart.items.length === 0 ? (
        <div className="text-center mt-20 p-10 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <p className="text-xl mb-6 font-light tracking-wide" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
            Your bag is empty
          </p>
          <Link to="/"
            className="inline-block px-8 py-3 font-medium text-sm uppercase tracking-widest transition"
            style={{ background: 'var(--theme-text)', color: '#fff' }}
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.productId?._id} className="p-4 flex gap-4 border transition"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                  <ImageCarousel images={item.productId?.images} alt={item.productId?.name} height="h-full" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-sm sm:text-base" style={{ color: 'var(--theme-text)' }}>{item.productId?.name}</h3>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>Qty: {item.quantity}</p>
                    {item.productId?.stock === 0 && (
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5">Out of Stock</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-semibold text-sm sm:text-base" style={{ color: 'var(--theme-primary)' }}>
                      ₹{(item.productId?.price * item.quantity).toFixed(2)}
                    </p>
                    <button onClick={() => handleRemoveItem(item.productId?._id)}
                      className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium px-3 py-1 hover:bg-red-50 transition">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-1 order-first lg:order-last mb-6 lg:mb-0">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 border lg:sticky lg:top-4"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
            >
              {subtotal < 500 && (
                <div className="p-3 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--theme-primary)', opacity: 0.3 }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
                    Add ₹{(500 - subtotal).toFixed(2)} more for FREE delivery!
                  </p>
                </div>
              )}
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--theme-text)' }}>Have a Coupon?</h3>
                  <button onClick={() => navigate('/coupons')}
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    Browse All
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {!couponInfo ? (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter coupon code" value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 p-2 sm:p-3 text-xs sm:text-sm uppercase focus:outline-none"
                      style={{ border: '1px solid var(--border)', color: 'var(--theme-text)', background: 'var(--input-bg)' }}
                    />
                    <button onClick={applyCoupon} disabled={applyingCoupon || !couponCode}
                      className="px-3 sm:px-4 py-2 sm:py-3 disabled:opacity-40 transition text-xs font-semibold uppercase tracking-wider"
                      style={{ background: 'var(--theme-text)', color: '#fff' }}
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="p-2 sm:p-3 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--theme-primary)', opacity: 0.3 }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs sm:text-sm" style={{ color: 'var(--theme-text)' }}>{couponInfo.code}</p>
                        <p className="text-[10px] sm:text-xs mt-1" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>{couponInfo.description}</p>
                        <p className="text-xs sm:text-sm font-bold mt-1" style={{ color: 'var(--theme-primary)' }}>Saved: ₹{couponInfo.discountAmount.toFixed(2)}</p>
                      </div>
                      <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium">Remove</button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--theme-text)' }}>Items ({cart.items.length})</h2>
                <div className="space-y-3 mb-4">
                  {cart.items.map(item => (
                    <div key={item.productId?._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 flex-shrink-0 overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                        {item.productId?.images?.[0] ? (
                          <img src={item.productId.images[0]} alt={item.productId.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: 'var(--theme-text)', opacity: 0.2 }}>No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--theme-text)' }}>{item.productId?.name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>Qty: {item.quantity} × ₹{item.productId?.price}</p>
                      </div>
                      <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--theme-text)' }}>₹{(item.productId?.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--theme-text)' }}>Cost Breakdown</h2>
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-xs sm:text-sm" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-medium" style={{ color: 'var(--theme-text)' }}>₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span style={{ opacity: 0.4 }}>Calculated at checkout</span>
                  </div>
                  {couponInfo && (
                    <div className="flex justify-between" style={{ color: 'var(--theme-primary)' }}>
                      <span>Discount ({couponInfo.code})</span>
                      <span>-₹{couponInfo.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t pt-3 sm:pt-4 mb-4 sm:mb-6" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text)' }}>Total</span>
                    <span className="font-heading text-2xl font-semibold" style={{ color: 'var(--theme-primary)' }}>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                {hasOutOfStock && (
                  <div className="p-3 bg-red-50 border border-red-200">
                    <p className="text-xs text-red-600 font-medium text-center">Some items are out of stock. Remove them to proceed.</p>
                    <div className="mt-2 space-y-1">
                      {cart.items.filter(i => i.productId?.stock === 0).map(item => (
                        <div key={item.productId?._id} className="flex items-center justify-between text-xs text-red-500">
                          <span className="truncate">{item.productId?.name}</span>
                          <button onClick={() => handleRemoveItem(item.productId?._id)} className="font-semibold hover:text-red-700 ml-2 shrink-0">Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Link to={hasOutOfStock ? '#' : '/checkout'} state={{ couponInfo }}
                  onClick={hasOutOfStock ? (e) => e.preventDefault() : undefined}
                >
                  <button disabled={hasOutOfStock}
                    className="w-full py-3 font-semibold transition text-xs sm:text-sm uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed text-white"
                    style={{ background: 'var(--theme-primary)' }}
                  >
                    Proceed to Checkout
                  </button>
                </Link>
                <p className="text-[10px] sm:text-xs text-center mt-3 sm:mt-4 uppercase tracking-widest"
                  style={{ color: 'var(--theme-text)', opacity: 0.3 }}
                >
                  Secure SSL Encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
