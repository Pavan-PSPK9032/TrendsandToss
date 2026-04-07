import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ManualUPI from '../components/ManualUPI'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Checkout() {
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  
  // Get shipping info passed from Cart page
  const location = useLocation()
  const { shippingInfo, pincode: cartPincode } = location.state || {}
  
  const [address, setAddress] = useState({
    fullName: '', phone: '', address: '', city: '', state: '', pincode: '', country: 'India'
  })
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      toast.error('Please login to checkout')
      navigate('/login')
      return
    }
    fetchCart()
    loadRazorpayScript()
  }, [navigate])

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart')
      setCart(data)
    } catch (err) {
      toast.error('Failed to load cart')
      navigate('/cart')
    } finally {
      setLoading(false)
    }
  }

  const loadRazorpayScript = () => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }

  // Calculate subtotal (items only)
  const subtotal = cart.items.reduce((sum, item) => 
    sum + (item.productId?.price || 0) * item.quantity, 0
  )

  // Get shipping charge from passed info or default
  const shippingCharge = shippingInfo?.isFree ? 0 : (shippingInfo?.shippingCharge || 0)
  
  // Total = Subtotal + Shipping
  const total = subtotal + shippingCharge

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
  }

  const handleCODOrder = async () => {
    if (!validateAddress()) return
    setProcessing(true)
    try {
      const { data } = await api.post('/orders/create', { 
        shippingAddress: { ...address, pincode: address.pincode || cartPincode },
        paymentMethod: 'cod',
        shippingCharge,
        shippingZone: shippingInfo?.zone,
        subtotal,
        total
      })
      toast.success('Order placed successfully! 📦')
      navigate('/order-confirmation', { state: { order: data.order } })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setProcessing(false)
    }
  }

  const handleOnlinePayment = async () => {
    if (!validateAddress()) return
    setProcessing(true)
    try {
      const { data: orderData } = await api.post('/orders/razorpay/order', { amount: total })
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Trends&Toss',
        description: 'Order Payment',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            await api.post('/orders/razorpay/verify', response)
            const { data } = await api.post('/orders/create', {
              shippingAddress: { ...address, pincode: address.pincode || cartPincode },
              paymentMethod: 'razorpay',
              paymentId: response.razorpay_payment_id,
              paymentStatus: 'paid',
              razorpayOrderId: response.razorpay_order_id,
              shippingCharge,
              shippingZone: shippingInfo?.zone,
              subtotal,
              total
            })
            toast.success('Payment successful! 🎉')
            navigate('/order-confirmation', { state: { order: data.order } })
          } catch (err) {
            toast.error('Payment verification failed')
          } finally {
            setProcessing(false)
          }
        },
        prefill: {
          name: address.fullName,
          email: JSON.parse(localStorage.getItem('user'))?.email || '',
          contact: address.phone
        },
        theme: { color: '#d97706' },
        modal: { ondismiss: () => setProcessing(false) }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed')
      setProcessing(false)
    }
  }

  const handleUPIOrder = async (transactionId) => {
    if (!validateAddress()) return
    if (!transactionId) {
      toast.error('Please enter the UPI transaction ID')
      return
    }
    
    setProcessing(true)
    try {
      const { data } = await api.post('/orders/create', { 
        shippingAddress: { ...address, pincode: address.pincode || cartPincode },
        paymentMethod: 'upi',
        paymentId: transactionId,
        paymentStatus: 'pending', // Manual UPI needs admin verification
        shippingCharge,
        shippingZone: shippingInfo?.zone,
        subtotal,
        total
      })
      toast.success('Order placed! We will verify your UPI payment 📦')
      navigate('/order-confirmation', { state: { order: data.order } })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setProcessing(false)
    }
  }

  const validateAddress = () => {
    if (!address.fullName || !address.phone || !address.address || !address.pincode) {
      toast.error('Please fill all required address fields')
      return false
    }
    if (address.phone.length < 10) {
      toast.error('Enter a valid 10-digit phone number')
      return false
    }
    return true
  }

  if (loading) return <div className="text-center mt-20 text-slate-500">Loading checkout...</div>

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-light text-slate-900 mb-8 tracking-tight">Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-medium text-slate-900 mb-4">Shipping Address</h2>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="Full Name *" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
                <input type="tel" name="phone" value={address.phone} onChange={handleAddressChange} placeholder="Phone *" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
              </div>
              <textarea name="address" value={address.address} onChange={handleAddressChange} placeholder="Street Address *" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none h-24" required />
              <div className="grid sm:grid-cols-3 gap-4">
                <input type="text" name="city" value={address.city} onChange={handleAddressChange} placeholder="City" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                <input type="text" name="state" value={address.state} onChange={handleAddressChange} placeholder="State" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                <input type="text" name="pincode" value={address.pincode} onChange={handleAddressChange} placeholder="Pincode *" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-4">
            <h2 className="text-xl font-medium text-slate-900 mb-4">Order Summary</h2>
            
            {/* Shipping Info Display */}
            {shippingInfo && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${shippingInfo.isFree ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-700'}`}>
                <p className="font-medium">{shippingInfo.message}</p>
                <p className="text-xs mt-1">
                  📍 {cartPincode} • {shippingInfo.estimatedDays}
                </p>
              </div>
            )}
            
            <div className="space-y-3 mb-6 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.length} items)</span>
                <span className="font-medium text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping ({shippingInfo?.zone || 'Standard'})</span>
                <span className={shippingInfo?.isFree ? 'text-emerald-600 font-semibold' : ''}>
                  {shippingInfo ? (shippingInfo.isFree ? 'Free' : `₹${shippingInfo.shippingCharge}`) : 'Calculating...'}
                </span>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-slate-900">Total</span>
                <span className="text-2xl font-light text-slate-900">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 mb-6">
              {/* Razorpay Option */}
              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'razorpay' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="text-amber-600 focus:ring-amber-500" />
                <div className="flex-1">
                  <div className="font-medium text-slate-900 flex items-center gap-2">
                    Online Payment 
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">UPI, Cards, Netbanking</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">Secure & Instant</span>
                    <div className="flex gap-1 ml-2">
                      <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200">GPay</span>
                      <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200">PhonePe</span>
                      <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200">Paytm</span>
                    </div>
                  </div>
                </div>
              </label>
              
              {/* Direct UPI Option */}
              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'upi' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="text-amber-600 focus:ring-amber-500" />
                <div>
                  <div className="font-medium text-slate-900">Direct UPI Payment</div>
                  <div className="text-xs text-slate-500">Scan QR or use UPI ID • Manual verification</div>
                </div>
              </label>
              
              {/* COD Option */}
              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-amber-600 focus:ring-amber-500" />
                <div>
                  <div className="font-medium text-slate-900">Cash on Delivery</div>
                  <div className="text-xs text-slate-500">Pay when you receive</div>
                </div>
              </label>
            </div>

            {/* Manual UPI Component */}
            {paymentMethod === 'upi' && (
              <div className="mb-6">
                <ManualUPI amount={total} onPaymentComplete={handleUPIOrder} />
              </div>
            )}

            {/* Action Button */}
            {paymentMethod !== 'upi' && (
              <button 
                onClick={paymentMethod === 'cod' ? handleCODOrder : handleOnlinePayment}
                disabled={processing || !shippingInfo}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-lg"
              >
                {processing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Securely'}
              </button>
            )}
            
            <p className="text-xs text-center text-slate-400 mt-4">🔒 Secure SSL Encryption • 30-day returns</p>
          </div>
        </div>
      </div>
    </div>
  )
}