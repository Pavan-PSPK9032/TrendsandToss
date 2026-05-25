import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLoadScript } from '@react-google-maps/api'
import ManualUPI from '../components/ManualUPI'
import api from '../api/axios'
import toast from 'react-hot-toast'

const libraries = ['places']

export default function Checkout() {
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('upi')

  const location = useLocation()
  const { shippingInfo: cartShippingInfo, pincode: cartPincode } = location.state || {}

  const [address, setAddress] = useState({
    fullName: '', phone: '', address: '', city: '', state: '', pincode: '', country: 'India'
  })
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [fetchingDelivery, setFetchingDelivery] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const autocompleteRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      toast.error('Please login to checkout')
      navigate('/login')
      return
    }
    fetchCart()
  }, [navigate])

  useEffect(() => {
    if (!isLoaded || !window.google) return
    const input = inputRef.current
    if (!input) return

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      types: ['address'],
      componentRestrictions: { country: 'in' },
      fields: ['address_components', 'formatted_address', 'geometry'],
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place || !place.address_components) return

      const components = {}
      place.address_components.forEach((comp) => {
        const type = comp.types[0]
        components[type] = comp.long_name
      })

      const street = [components.street_number, components.route].filter(Boolean).join(' ')
      const city = components.locality || components.sublocality_level_1 || components.sublocality || components.administrative_area_level_2 || ''
      const state = components.administrative_area_level_1 || ''
      const pincode = components.postal_code || ''
      const country = components.country || 'India'

      setAddress(prev => ({
        ...prev,
        address: place.formatted_address || street,
        city,
        state,
        pincode,
        country,
      }))

      setShowSuggestions(false)

      if (/^[0-9]{6}$/.test(pincode)) {
        checkDelivery(pincode)
      }
    })

    autocompleteRef.current = autocomplete
  }, [isLoaded])

  const checkDelivery = async (pincode) => {
    setFetchingDelivery(true)
    setDeliveryInfo(null)
    try {
      const { data } = await api.get(`/shipping/check/${pincode}`)
      const subtotal = cart.items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0)
      const isFree = subtotal >= 500
      setDeliveryInfo({
        available: data.available,
        charge: isFree ? 0 : data.charge,
        shippingCharge: isFree ? 0 : data.charge,
        isFree,
        estimatedDays: data.estimatedDays,
        message: isFree ? 'FREE delivery on this order!' : data.message,
        pincode,
        source: data.source,
        breakdown: data.breakdown,
        codAvailable: true,
      })
    } catch {
      setDeliveryInfo(null)
    } finally {
      setFetchingDelivery(false)
    }
  }

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart')
      setCart(data)
    } catch {
      toast.error('Failed to load cart')
      navigate('/cart')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0)

  const shippingInfo = deliveryInfo || cartShippingInfo
  const shippingCharge = shippingInfo?.isFree ? 0 : (shippingInfo?.shippingCharge || 0)
  const total = subtotal + shippingCharge

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
    if (e.target.name === 'pincode' && /^[0-9]{6}$/.test(e.target.value)) {
      checkDelivery(e.target.value)
    }
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
        paymentStatus: 'pending',
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

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto p-4 sm:p-6 mt-10 text-center">
        <div className="bg-red-50 border border-red-200 p-6">
          <h2 className="font-semibold text-red-700 mb-2">Maps API Error</h2>
          <p className="text-sm text-red-600">Failed to load address autocomplete. Please check your Google Maps API key.</p>
        </div>
      </div>
    )
  }

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
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30 pointer-events-none z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search your address *"
                  className="w-full p-3 pl-10 border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none text-navy text-sm"
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {!isLoaded && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-gold border-t-transparent animate-spin"></div>
                  </div>
                )}
              </div>
              <textarea
                name="address"
                value={address.address}
                onChange={handleAddressChange}
                placeholder="Street Address *"
                className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none text-navy text-sm h-20"
                required
              />
              <div className="grid sm:grid-cols-3 gap-4">
                <input type="text" name="city" value={address.city} onChange={handleAddressChange} placeholder="City" className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none text-navy text-sm" />
                <input type="text" name="state" value={address.state} onChange={handleAddressChange} placeholder="State" className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none text-navy text-sm" />
                <input type="text" name="pincode" value={address.pincode} onChange={handleAddressChange} placeholder="Pincode *" className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none text-navy text-sm" required />
              </div>
            </form>
          </div>

          {deliveryInfo && (
            <div className={`border ${deliveryInfo.isFree ? 'border-gold/30 bg-gold/[0.03]' : 'border-navy/10 bg-white'}`}>
              <div className="p-5">
                <h3 className="font-semibold text-navy text-xs uppercase tracking-widest mb-4">Delivery Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 flex items-center justify-center bg-green-50 text-green-600 text-xs font-bold">&#10003;</span>
                    <span className="text-navy/70">Delivery Available to <span className="font-medium text-navy">{deliveryInfo.pincode}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 flex items-center justify-center bg-navy/[0.05] text-navy text-xs">&#128666;</span>
                    <span className="text-navy/70">Delivery in <span className="font-medium text-navy">{deliveryInfo.estimatedDays}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 flex items-center justify-center bg-gold/10 text-gold text-xs font-bold">&#8377;</span>
                    <span className="text-navy/70">
                      {deliveryInfo.isFree ? (
                        <span className="text-gold font-semibold">FREE Shipping</span>
                      ) : (
                        <>Shipping <span className="font-medium text-navy">Rs.{deliveryInfo.shippingCharge}</span></>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 flex items-center justify-center bg-green-50 text-green-600 text-xs font-bold">&#8377;</span>
                    <span className="text-navy/70">Cash on Delivery <span className="font-medium text-green-600">Available</span></span>
                  </div>
                </div>

                {!deliveryInfo.isFree && deliveryInfo.breakdown && deliveryInfo.source === 'delhivery' && (
                  <div className="mt-3 pt-3 border-t border-navy/10 text-xs space-y-1 text-navy/50">
                    <div className="flex justify-between"><span>Base charge</span><span>Rs.{deliveryInfo.breakdown.base}</span></div>
                    {deliveryInfo.breakdown.fuelSurcharge > 0 && (
                      <div className="flex justify-between"><span>Fuel surcharge</span><span>Rs.{deliveryInfo.breakdown.fuelSurcharge}</span></div>
                    )}
                    {deliveryInfo.breakdown.odaSurcharge > 0 && (
                      <div className="flex justify-between"><span>ODA surcharge</span><span>Rs.{deliveryInfo.breakdown.odaSurcharge}</span></div>
                    )}
                    <div className="flex justify-between font-medium text-navy pt-1 border-t border-navy/10">
                      <span>Total</span><span>Rs.{deliveryInfo.breakdown.total}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {fetchingDelivery && (
            <div className="border border-navy/10 bg-navy/[0.02] p-5">
              <div className="flex items-center gap-3 text-sm text-navy/60">
                <div className="w-5 h-5 border-2 border-gold border-t-transparent animate-spin"></div>
                Checking delivery availability...
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-navy/10 p-6 sticky top-4">
            <h2 className="font-semibold text-navy text-sm uppercase tracking-widest mb-4">Order Summary</h2>

            {cartShippingInfo && !deliveryInfo && !fetchingDelivery && (
              <div className={`mb-4 p-3 text-sm ${cartShippingInfo.isFree ? 'bg-gold/10 text-navy border border-gold/30' : 'bg-gray-50 text-navy/70 border border-navy/10'}`}>
                <p className="font-medium">{cartShippingInfo.message}</p>
                <p className="text-xs mt-1">{cartPincode} &bull; {cartShippingInfo.estimatedDays}</p>
              </div>
            )}

            <div className="space-y-3 mb-6 text-navy/60 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.length} items)</span>
                <span className="font-medium text-navy">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shippingInfo?.isFree ? 'text-gold font-semibold' : ''}>
                  {shippingInfo ? (shippingInfo.isFree ? 'Free' : `Rs.${shippingInfo.shippingCharge}`) : 'Calculating...'}
                </span>
              </div>
            </div>

            <div className="border-t border-navy/10 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-navy">Total</span>
                <span className="font-playfair text-2xl font-semibold text-navy">Rs.{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className={`flex items-center gap-3 p-4 border cursor-pointer transition ${paymentMethod === 'upi' ? 'border-gold bg-gold/5' : 'border-navy/10 hover:border-gold/40'}`}>
                <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="text-gold focus:ring-gold" />
                <div>
                  <div className="font-medium text-navy">Direct UPI Payment</div>
                  <div className="text-xs text-navy/50">Scan QR or use UPI ID &bull; Manual verification</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border cursor-pointer transition ${paymentMethod === 'cod' ? 'border-gold bg-gold/5' : 'border-navy/10 hover:border-gold/40'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-gold focus:ring-gold" />
                <div>
                  <div className="font-medium text-navy">Cash on Delivery</div>
                  <div className="text-xs text-navy/50">Pay when you receive</div>
                </div>
              </label>
            </div>

            {paymentMethod === 'upi' && (
              <div className="mb-6">
                <ManualUPI amount={total} onPaymentComplete={handleUPIOrder} />
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="space-y-3">
                <button
                  onClick={handleCODOrder}
                  disabled={processing || (!deliveryInfo && !cartShippingInfo)}
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
