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
  const [pincode, setPincode] = useState('')
  const [shippingInfo, setShippingInfo] = useState(null)
  const [checkingShipping, setCheckingShipping] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponInfo, setCouponInfo] = useState(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  // Handle coupon passed from Coupons page
  useEffect(() => {
    if (location.state?.appliedCoupon) {
      const { appliedCoupon } = location.state
      setCouponInfo({
        code: appliedCoupon.code,
        discountAmount: appliedCoupon.discountAmount,
        description: appliedCoupon.description
      })
      toast.success(`Coupon ${appliedCoupon.code} applied!`)
      // Clear the state to prevent re-applying on refresh
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

  const shippingCharge = shippingInfo?.isFree ? 0 : (shippingInfo?.charge || 0)
  const discountAmount = couponInfo?.discountAmount || 0
  const total = subtotal + shippingCharge - discountAmount

  const checkShipping = async () => {
    if (pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode')
      return
    }
    
    setCheckingShipping(true)
    try {
      console.log('Checking pincode:', pincode)
      const { data } = await api.get(`/shipping/check/${pincode}`)
      console.log('Shipping data received:', data)
      
      // Check if order qualifies for free delivery (above ₹500)
      const isFree = subtotal >= 500
      const charge = isFree ? 0 : data.charge
      
      setShippingInfo({
        available: data.available,
        charge: charge,
        shippingCharge: charge,
        isFree: isFree,
        estimatedDays: data.estimatedDays,
        message: isFree ? 'FREE delivery on this order!' : data.message
      })
      
      toast.success(isFree ? 'You got FREE delivery!' : 'Pincode verified!')
    } catch (err) {
      console.error('Shipping check error:', err)
      toast.error('Failed to check delivery. Please try again.')
    } finally {
      setCheckingShipping(false)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }
    
    setApplyingCoupon(true)
    try {
      console.log('Applying coupon:', couponCode, 'Subtotal:', subtotal)
      const { data } = await api.post('/coupons/validate', {
        code: couponCode,
        orderValue: subtotal
      })
      
      console.log('Coupon validated:', data)
      setCouponInfo(data)
      toast.success(`Coupon applied! You saved Rs.${data.discountAmount.toFixed(2)}`)
    } catch (err) {
      console.error('Coupon error:', err)
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
      // Update local cart state
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.productId?._id !== productId)
      }))
      toast.success('Item removed from cart')
    } catch (err) {
      console.error('Error removing item:', err)
      toast.error('Failed to remove item')
    }
  }

  if (loading) return <div className="text-center mt-20 text-navy/40 tracking-wide">Loading cart...</div>

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="font-playfair text-3xl font-semibold text-navy mb-8 tracking-tight">Shopping Bag</h1>
      
      {cart.items.length === 0 ? (
        <div className="text-center mt-20 p-10 bg-white border border-navy/10">
          <p className="text-xl text-navy/40 mb-6 font-light tracking-wide">Your bag is empty</p>
          <Link to="/" className="inline-block bg-navy text-white px-8 py-3 hover:bg-navy-light transition font-medium text-sm uppercase tracking-widest">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.productId?._id} className="bg-white border border-navy/10 p-4 flex gap-4 hover:border-gold/40 transition">
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                  <ImageCarousel images={item.productId?.images} alt={item.productId?.name} height="h-full" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-navy text-sm sm:text-base">{item.productId?.name}</h3>
                    <p className="text-navy/40 text-xs sm:text-sm mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-semibold text-navy text-sm sm:text-base">₹{(item.productId?.price * item.quantity).toFixed(2)}</p>
                    <button 
                      onClick={() => handleRemoveItem(item.productId?._id)}
                      className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium px-3 py-1 hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 order-first lg:order-last mb-6 lg:mb-0">
            <div className="bg-white border border-navy/10 p-4 sm:p-6 space-y-4 sm:space-y-6 lg:sticky lg:top-4">
              {/* Free Delivery Banner */}
              {subtotal < 500 && (
                <div className="bg-gold/10 border border-gold/30 p-3">
                  <p className="text-sm text-navy font-medium">
                    Add ₹{(500 - subtotal).toFixed(2)} more for FREE delivery!
                  </p>
                </div>
              )}
              
              {/* Pincode Checker */}
              <div>
                <h3 className="font-semibold text-navy mb-3 text-xs uppercase tracking-widest">Check Delivery</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter pincode"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 p-2 sm:p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm"
                  />
                  <button 
                    onClick={checkShipping}
                    disabled={checkingShipping || pincode.length !== 6}
                    className="bg-navy text-white px-3 sm:px-4 py-2 sm:py-3 hover:bg-navy-light disabled:opacity-40 transition text-xs font-semibold uppercase tracking-wider"
                  >
                    {checkingShipping ? '...' : 'Check'}
                  </button>
                </div>
                {shippingInfo && (
                  <div className={`mt-3 p-3 text-xs sm:text-sm ${shippingInfo.isFree ? 'bg-gold/10 text-navy border border-gold/30' : 'bg-gray-50 text-navy/70 border border-navy/10'}`}>
                    <p className="font-medium">{shippingInfo.message}</p>
                    <p className="text-[10px] sm:text-xs mt-1">
                      {shippingInfo.isFree ? 'Free' : `₹${shippingInfo.shippingCharge}`} • Delivery in {shippingInfo.estimatedDays}
                    </p>
                  </div>
                )}
              </div>

              {/* Coupon Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-navy text-xs uppercase tracking-widest">Have a Coupon?</h3>
                  <button
                    onClick={() => navigate('/coupons')}
                    className="text-xs text-gold hover:text-gold-dark font-medium flex items-center gap-1"
                  >
                    Browse All
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {!couponInfo ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 p-2 sm:p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none text-xs sm:text-sm uppercase text-navy"
                    />
                    <button 
                      onClick={applyCoupon}
                      disabled={applyingCoupon || !couponCode}
                      className="bg-navy text-white px-3 sm:px-4 py-2 sm:py-3 hover:bg-navy-light disabled:opacity-40 transition text-xs font-semibold uppercase tracking-wider"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gold/10 border border-gold/30 p-2 sm:p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-navy text-xs sm:text-sm">{couponInfo.code}</p>
                        <p className="text-[10px] sm:text-xs text-navy/60 mt-1">{couponInfo.description}</p>
                        <p className="text-xs sm:text-sm font-bold text-gold mt-1">Saved: ₹{couponInfo.discountAmount.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-navy mb-4">Items ({cart.items.length})</h2>
                <div className="space-y-3 mb-4">
                  {cart.items.map(item => (
                    <div key={item.productId?._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 flex-shrink-0 border border-navy/10 overflow-hidden bg-gray-50">
                        {item.productId?.images?.[0] ? (
                          <img src={item.productId.images[0]} alt={item.productId.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-navy/20 text-xs">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-navy font-medium truncate">{item.productId?.name}</p>
                        <p className="text-[10px] text-navy/40">Qty: {item.quantity} × ₹{item.productId?.price}</p>
                      </div>
                      <span className="text-xs font-semibold text-navy whitespace-nowrap">₹{(item.productId?.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-navy mb-4">Cost Breakdown</h2>
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-navy/60 text-xs sm:text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-navy font-medium">₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shippingInfo?.isFree ? 'text-gold font-medium' : ''}>
                      {shippingInfo ? (shippingInfo.isFree ? 'Free' : `₹${shippingInfo.shippingCharge}`) : '-'}
                    </span>
                  </div>
                  {couponInfo && (
                    <div className="flex justify-between text-gold">
                      <span>Discount ({couponInfo.code})</span>
                      <span>-₹{couponInfo.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-navy/10 pt-3 sm:pt-4 mb-4 sm:mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-navy">Total</span>
                    <span className="font-playfair text-2xl font-semibold text-navy">₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <Link to="/checkout" state={{ shippingInfo, pincode, couponInfo }}>
                  <button 
                    disabled={!shippingInfo}
                    className="w-full bg-gold text-white py-3 font-semibold hover:bg-gold-dark transition disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm uppercase tracking-widest"
                  >
                    {shippingInfo ? 'Proceed to Checkout' : 'Check Pincode First'}
                  </button>
                </Link>
                <p className="text-[10px] sm:text-xs text-center text-navy/30 mt-3 sm:mt-4 uppercase tracking-widest">Secure SSL Encryption</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
