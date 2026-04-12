import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ImageCarousel from '../components/ImageCarousel'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function Cart() {
  const { removeFromCart, updateCartUI } = useCart()
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(true)
  const [pincode, setPincode] = useState('')
  const [shippingInfo, setShippingInfo] = useState(null)
  const [checkingShipping, setCheckingShipping] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponInfo, setCouponInfo] = useState(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

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
      alert('Please enter a valid 6-digit pincode')
      return
    }
    
    setCheckingShipping(true)
    try {
      const { data } = await api.get(`/shipping/check/${pincode}`)
      
      // Check if order qualifies for free delivery
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
    } catch (err) {
      alert('Failed to calculate shipping. Please try again.')
    } finally {
      setCheckingShipping(false)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code')
      return
    }
    
    setApplyingCoupon(true)
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode,
        orderValue: subtotal
      })
      
      setCouponInfo(data)
      alert(`✅ Coupon applied! You saved ₹${data.discountAmount}`)
    } catch (err) {
      setCouponInfo(null)
      alert(err.response?.data?.error || 'Invalid coupon code')
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

  if (loading) return <div className="text-center mt-20 text-slate-500">Loading cart...</div>

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-light text-slate-900 mb-8 tracking-tight">Shopping Bag</h1>
      
      {cart.items.length === 0 ? (
        <div className="text-center mt-20 p-10 bg-white rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xl text-slate-600 mb-6 font-light">Your bag is empty</p>
          <Link to="/" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition font-medium">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.productId?._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex gap-4 hover:shadow-md transition">
                <div className="w-24 h-24 flex-shrink-0">
                  <ImageCarousel images={item.productId?.images} alt={item.productId?.name} height="h-full" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{item.productId?.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">₹{(item.productId?.price * item.quantity).toFixed(2)}</p>
                    <button 
                      onClick={() => handleRemoveItem(item.productId?._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-4 space-y-6">
              {/* Pincode Checker */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Check Delivery</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter pincode"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                  />
                  <button 
                    onClick={checkShipping}
                    disabled={checkingShipping || pincode.length !== 6}
                    className="bg-slate-900 text-white px-4 py-3 rounded-xl hover:bg-slate-800 disabled:bg-slate-300 transition text-sm font-medium"
                  >
                    {checkingShipping ? '...' : 'Check'}
                  </button>
                </div>
                {shippingInfo && (
                  <div className={`mt-3 p-3 rounded-xl text-sm ${shippingInfo.isFree ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-700'}`}>
                    <p className="font-medium">{shippingInfo.message}</p>
                    <p className="text-xs mt-1">
                      {shippingInfo.isFree ? '✅' : `₹${shippingInfo.shippingCharge} • `}
                      Delivery in {shippingInfo.estimatedDays}
                    </p>
                  </div>
                )}
              </div>

              {/* Coupon Section */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Have a Coupon?</h3>
                {!couponInfo ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm uppercase"
                    />
                    <button 
                      onClick={applyCoupon}
                      disabled={applyingCoupon || !couponCode}
                      className="bg-slate-900 text-white px-4 py-3 rounded-xl hover:bg-slate-800 disabled:bg-slate-300 transition text-sm font-medium"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-emerald-800">✅ {couponInfo.code}</p>
                        <p className="text-xs text-emerald-700 mt-1">{couponInfo.description}</p>
                        <p className="text-sm font-bold text-emerald-800 mt-1">Saved: ₹{couponInfo.discountAmount}</p>
                      </div>
                      <button 
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-medium text-slate-900 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6 text-slate-600">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shippingInfo?.isFree ? 'text-emerald-600 font-medium' : ''}>
                      {shippingInfo ? (shippingInfo.isFree ? 'Free' : `₹${shippingInfo.shippingCharge}`) : '-'}
                    </span>
                  </div>
                  {couponInfo && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({couponInfo.code})</span>
                      <span>-₹{couponInfo.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-slate-900">Total</span>
                    <span className="text-2xl font-light text-slate-900">₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <Link to="/checkout" state={{ shippingInfo, pincode, couponInfo }}>
                  <button 
                    disabled={!shippingInfo}
                    className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {shippingInfo ? 'Proceed to Checkout' : 'Check Pincode First'}
                  </button>
                </Link>
                <p className="text-xs text-center text-slate-400 mt-4">🔒 Secure SSL Encryption</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}