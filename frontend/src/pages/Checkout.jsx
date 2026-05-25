import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ManualUPI from '../components/ManualUPI'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Checkout() {
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  
  // Get shipping info passed from Cart page
  const location = useLocation()
  const { shippingInfo: cartShippingInfo, pincode: cartPincode } = location.state || {}
  
  const [address, setAddress] = useState({
    fullName: '', phone: '', address: '', city: '', state: '', pincode: '', country: 'India'
  })
  const [checkoutShipping, setCheckoutShipping] = useState(null)
  const [fetchingShipping, setFetchingShipping] = useState(false)
  const debounceRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      toast.error('Please login to checkout')
      navigate('/login')
      return
    }
    fetchCart()
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

  // Calculate subtotal (items only)
  const subtotal = cart.items.reduce((sum, item) => 
    sum + (item.productId?.price || 0) * item.quantity, 0
  )

  // Use shipping from checkout address if available, else fall back to Cart-passed info
  const shippingInfo = checkoutShipping || cartShippingInfo
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
      toast.success('Order placed successfully!')
      navigate('/order-confirmation', { state: { order: data.order } })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
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
      toast.success('Order placed! We will verify your UPI payment')
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

  if (loading) return <div className="text-center mt-20 text-navy/40 tracking-wide">Loading checkout...</div>

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="font-playfair text-3xl font-semibold text-navy mb-8 tracking-tight">Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-semibold text-navy text-sm uppercase tracking-widest mb-4">Shipping Address</h2>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="Full Name *" className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none text-navy text-sm" required />
                <input type="tel" name="phone" value={address.phone} onChange={handleAddressChange} placeholder="Phone *" className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none text-navy text-sm" required />
              </div>
              <textarea name="address" value={address.address} onChange={handleAddressChange} placeholder="Street Address *" className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none text-navy text-sm h-24" required />
              <div className="grid sm:grid-cols-3 gap-4">
                <input type="text" name="city" value={address.city} onChange={handleAddressChange} placeholder="City" className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none text-navy text-sm" />
                <input type="text" name="state" value={address.state} onChange={handleAddressChange} placeholder="State" className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none text-navy text-sm" />
                <input type="text" name="pincode" value={address.pincode} onChange={handleAddressChange} placeholder="Pincode *" className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none text-navy text-sm" required />
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-navy/10 p-6 sticky top-4">
            <h2 className="font-semibold text-navy text-sm uppercase tracking-widest mb-4">Order Summary</h2>
            
            {/* Shipping Info Display */}
            {fetchingShipping && (
              <div className="mb-4 p-3 text-sm bg-gray-50 text-navy/50 border border-navy/10">
                <p className="font-medium">Calculating shipping...</p>
              </div>
            )}
            {!fetchingShipping && checkoutShipping && (
              <div className={`mb-4 p-3 text-sm ${checkoutShipping.isFree ? 'bg-gold/10 text-navy border border-gold/30' : 'bg-gray-50 text-navy/70 border border-navy/10'}`}>
                <p className="font-medium">{checkoutShipping.message}</p>
                <p className="text-xs mt-1">
                  {checkoutShipping.pincode} {String.fromCharCode(8226)} {checkoutShipping.estimatedDays}
                </p>
                {!checkoutShipping.isFree && checkoutShipping.breakdown && checkoutShipping.source === 'delhivery' && (
                  <div className="mt-2 pt-2 border-t border-navy/10 text-[11px] space-y-1">
                    <div className="flex justify-between"><span>Base charge</span><span>Rs.{checkoutShipping.breakdown.base}</span></div>
                    {checkoutShipping.breakdown.fuelSurcharge > 0 && (
                      <div className="flex justify-between"><span>Fuel surcharge</span><span>Rs.{checkoutShipping.breakdown.fuelSurcharge}</span></div>
                    )}
                    {checkoutShipping.breakdown.odaSurcharge > 0 && (
                      <div className="flex justify-between"><span>ODA surcharge</span><span>Rs.{checkoutShipping.breakdown.odaSurcharge}</span></div>
                    )}
                    {checkoutShipping.breakdown.gst > 0 && (
                      <div className="flex justify-between"><span>GST</span><span>Rs.{checkoutShipping.breakdown.gst}</span></div>
                    )}
                    <div className="flex justify-between font-semibold text-navy pt-1 border-t border-navy/10">
                      <span>Total shipping</span><span>Rs.{checkoutShipping.breakdown.total}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!fetchingShipping && !checkoutShipping && cartShippingInfo && (
              <div className={`mb-4 p-3 text-sm ${cartShippingInfo.isFree ? 'bg-gold/10 text-navy border border-gold/30' : 'bg-gray-50 text-navy/70 border border-navy/10'}`}>
                <p className="font-medium">{cartShippingInfo.message}</p>
                <p className="text-xs mt-1">
                  {cartPincode} {String.fromCharCode(8226)} {cartShippingInfo.estimatedDays}
                </p>
              </div>
            )}
            
            <div className="space-y-3 mb-6 text-navy/60 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.length} items)</span>
                <span className="font-medium text-navy">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping ({shippingInfo?.zone || 'Standard'})</span>
                <span className={shippingInfo?.isFree ? 'text-gold font-semibold' : ''}>
                  {shippingInfo ? (shippingInfo.isFree ? 'Free' : `₹${shippingInfo.shippingCharge}`) : 'Calculating...'}
                </span>
              </div>
            </div>
            
            <div className="border-t border-navy/10 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-navy">Total</span>
                <span className="font-playfair text-2xl font-semibold text-navy">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 mb-6">
              {/* Direct UPI Option */}
              <label className={`flex items-center gap-3 p-4 border cursor-pointer transition ${paymentMethod === 'upi' ? 'border-gold bg-gold/5' : 'border-navy/10 hover:border-gold/40'}`}>
                <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="text-gold focus:ring-gold" />
                <div>
                  <div className="font-medium text-navy">Direct UPI Payment</div>
                  <div className="text-xs text-navy/50">Scan QR or use UPI ID {String.fromCharCode(8226)} Manual verification</div>
                </div>
              </label>
              
              {/* COD Option */}
              <label className={`flex items-center gap-3 p-4 border cursor-pointer transition ${paymentMethod === 'cod' ? 'border-gold bg-gold/5' : 'border-navy/10 hover:border-gold/40'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-gold focus:ring-gold" />
                <div>
                  <div className="font-medium text-navy">Cash on Delivery</div>
                  <div className="text-xs text-navy/50">Pay when you receive</div>
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
            {paymentMethod === 'cod' && (
              <div className="space-y-3">
              <button 
                  onClick={handleCODOrder}
                  disabled={processing || !shippingInfo}
                  className="w-full bg-navy text-white py-3 font-semibold hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed transition text-sm uppercase tracking-widest"
                >
                  {processing ? 'Processing...' : 'Place Order (COD)'}
                </button>
                
                <p className="text-[10px] text-center text-navy/30 mt-4 uppercase tracking-widest">Secure SSL Encryption - 30-day returns</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}