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
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const location = useLocation()
  const { shippingInfo: cartShippingInfo, pincode: cartPincode, couponInfo } = location.state || {}

  const [address, setAddress] = useState({
    fullName: '', phone: '', address: '', city: '', state: '', pincode: '', country: 'India'
  })
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [fetchingDelivery, setFetchingDelivery] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [featuredCoupons, setFeaturedCoupons] = useState([])
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
    api.get('/coupons/featured').then(({ data }) => {
      if (data.length) setFeaturedCoupons(data)
    }).catch(() => {})
  }, [])

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
  const discountAmount = couponInfo?.discountAmount || 0
  const total = subtotal + shippingCharge - discountAmount

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
        discountAmount,
        couponCode: couponInfo?.code,
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
        discountAmount,
        couponCode: couponInfo?.code,
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

  if (loading) return <div className="text-center mt-20" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>Loading checkout...</div>

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="font-heading text-3xl font-semibold mb-8 tracking-tight" style={{ color: 'var(--theme-text)' }}>Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: 'var(--theme-text)' }}>Shipping Address</h2>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" name="fullName" value={address.fullName} onChange={handleAddressChange}
                  placeholder="Full Name *" required
                  className="w-full p-3 text-sm focus:outline-none"
                  style={{ border: '1px solid var(--border)', color: 'var(--theme-text)', background: 'var(--input-bg)' }} />
                <input type="tel" name="phone" value={address.phone} onChange={handleAddressChange}
                  placeholder="Phone *" required
                  className="w-full p-3 text-sm focus:outline-none"
                  style={{ border: '1px solid var(--border)', color: 'var(--theme-text)', background: 'var(--input-bg)' }} />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: 'var(--theme-text)', opacity: 0.3 }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input ref={inputRef} type="text" placeholder="Search your address *"
                  className="w-full p-3 pl-10 text-sm focus:outline-none"
                  style={{ border: '1px solid var(--border)', color: 'var(--theme-text)', background: 'var(--input-bg)' }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
              </div>
              <textarea name="address" value={address.address} onChange={handleAddressChange}
                placeholder="Street Address *" required
                className="w-full p-3 text-sm h-20 focus:outline-none"
                style={{ border: '1px solid var(--border)', color: 'var(--theme-text)', background: 'var(--input-bg)' }} />
              <div className="grid sm:grid-cols-3 gap-4">
                <input type="text" name="city" value={address.city} onChange={handleAddressChange}
                  placeholder="City"
                  className="w-full p-3 text-sm focus:outline-none"
                  style={{ border: '1px solid var(--border)', color: 'var(--theme-text)', background: 'var(--input-bg)' }} />
                <input type="text" name="state" value={address.state} onChange={handleAddressChange}
                  placeholder="State"
                  className="w-full p-3 text-sm focus:outline-none"
                  style={{ border: '1px solid var(--border)', color: 'var(--theme-text)', background: 'var(--input-bg)' }} />
                <input type="text" name="pincode" value={address.pincode} onChange={handleAddressChange}
                  placeholder="Pincode *" required
                  className="w-full p-3 text-sm focus:outline-none"
                  style={{ border: '1px solid var(--border)', color: 'var(--theme-text)', background: 'var(--input-bg)' }} />
              </div>
            </form>
          </div>

          {deliveryInfo && (
            <div className="border p-5" style={{
              background: deliveryInfo.isFree ? 'var(--bg-secondary)' : 'var(--card-bg)',
              borderColor: deliveryInfo.isFree ? 'var(--theme-primary)' : 'var(--border)'
            }}>
              <h3 className="font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--theme-text)' }}>Delivery Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 flex items-center justify-center bg-green-50 text-green-600 text-xs font-bold">&#10003;</span>
                  <span style={{ color: 'var(--theme-text)', opacity: 0.7 }}>Delivery Available to <span className="font-medium" style={{ color: 'var(--theme-text)' }}>{deliveryInfo.pincode}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 flex items-center justify-center text-xs" style={{ background: 'var(--bg-secondary)', color: 'var(--theme-text)' }}>&#128666;</span>
                  <span style={{ color: 'var(--theme-text)', opacity: 0.7 }}>Delivery in <span className="font-medium" style={{ color: 'var(--theme-text)' }}>{deliveryInfo.estimatedDays}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 flex items-center justify-center text-xs font-bold" style={{ background: 'var(--bg-secondary)', color: 'var(--theme-primary)' }}>&#8377;</span>
                  <span style={{ color: 'var(--theme-text)', opacity: 0.7 }}>
                    {deliveryInfo.isFree ? (
                      <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>FREE Shipping</span>
                    ) : (
                      <>Shipping <span className="font-medium" style={{ color: 'var(--theme-text)' }}>₹{deliveryInfo.shippingCharge}</span></>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 flex items-center justify-center bg-green-50 text-green-600 text-xs font-bold">&#8377;</span>
                  <span style={{ color: 'var(--theme-text)', opacity: 0.7 }}>Cash on Delivery <span className="font-medium" style={{ color: '#16a34a' }}>Available</span></span>
                </div>
              </div>
              {!deliveryInfo.isFree && deliveryInfo.breakdown && deliveryInfo.source === 'delhivery' && (
                <div className="mt-3 pt-3 border-t text-xs space-y-1" style={{ borderColor: 'var(--border)', color: 'var(--theme-text)', opacity: 0.5 }}>
                  <div className="flex justify-between"><span>Base charge</span><span>₹{deliveryInfo.breakdown.base}</span></div>
                  {deliveryInfo.breakdown.fuelSurcharge > 0 && (
                    <div className="flex justify-between"><span>Fuel surcharge</span><span>₹{deliveryInfo.breakdown.fuelSurcharge}</span></div>
                  )}
                  {deliveryInfo.breakdown.odaSurcharge > 0 && (
                    <div className="flex justify-between"><span>ODA surcharge</span><span>₹{deliveryInfo.breakdown.odaSurcharge}</span></div>
                  )}
                  <div className="flex justify-between font-medium pt-1 border-t" style={{ borderColor: 'var(--border)', color: 'var(--theme-text)' }}>
                    <span>Total</span><span>₹{deliveryInfo.breakdown.total}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {fetchingDelivery && (
            <div className="p-5 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>
                <div className="spinner"></div>
                Checking delivery availability...
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="p-6 border lg:sticky lg:top-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: 'var(--theme-text)' }}>Order Summary</h2>

            {cartShippingInfo && !deliveryInfo && !fetchingDelivery && (
              <div className="mb-4 p-3 text-sm border" style={{
                background: cartShippingInfo.isFree ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                borderColor: cartShippingInfo.isFree ? 'var(--theme-primary)' : 'var(--border)',
                color: 'var(--theme-text)'
              }}>
                <p className="font-medium">{cartShippingInfo.message}</p>
                <p className="text-xs mt-1">{cartPincode} &bull; {cartShippingInfo.estimatedDays}</p>
              </div>
            )}

            {featuredCoupons.length > 0 && !couponInfo && (
              <div className="mb-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--theme-primary)' }}>Available Offers</p>
                {featuredCoupons.map(c => (
                  <Link key={c._id} to="/coupons"
                    className="flex items-center gap-2 p-2 border text-left transition hover:shadow-sm"
                    style={{ borderColor: 'var(--theme-primary)', background: 'var(--bg-secondary)' }}
                  >
                    <span className="text-sm">🎉</span>
                    <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--theme-text)' }}>{c.code}</span>
                    <span className="text-[10px] ml-auto font-bold" style={{ color: 'var(--theme-primary)' }}>
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                    </span>
                  </Link>
                ))}
              </div>
            )}

              <div className="space-y-3 mb-6 text-sm" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>
                <div className="flex justify-between">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span className="font-medium" style={{ color: 'var(--theme-text)' }}>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shippingInfo?.isFree ? 'font-semibold' : ''}
                    style={{ color: shippingInfo?.isFree ? 'var(--theme-primary)' : 'var(--theme-text)' }}>
                    {shippingInfo ? (shippingInfo.isFree ? 'Free' : `₹${shippingInfo.shippingCharge}`) : 'Calculating...'}
                  </span>
                </div>
                {couponInfo && (
                  <div className="flex justify-between" style={{ color: 'var(--theme-primary)' }}>
                    <span>Discount ({couponInfo.code})</span>
                    <span>-₹{couponInfo.discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

            <div className="border-t pt-4 mb-6" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text)' }}>Total</span>
                <span className="font-heading text-2xl font-semibold" style={{ color: 'var(--theme-primary)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className={`flex items-center gap-3 p-4 border cursor-pointer transition`}
                style={{
                  borderColor: paymentMethod === 'upi' ? 'var(--theme-primary)' : 'var(--border)',
                  background: paymentMethod === 'upi' ? 'var(--bg-secondary)' : 'transparent'
                }}
              >
                <input type="radio" name="payment" value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="focus:ring-0" />
                <div>
                  <div className="font-medium" style={{ color: 'var(--theme-text)' }}>Direct UPI Payment</div>
                  <div className="text-xs" style={{ color: 'var(--theme-text)', opacity: 0.5 }}>Scan QR or use UPI ID &bull; Manual verification</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border cursor-pointer transition`}
                style={{
                  borderColor: paymentMethod === 'cod' ? 'var(--theme-primary)' : 'var(--border)',
                  background: paymentMethod === 'cod' ? 'var(--bg-secondary)' : 'transparent'
                }}
              >
                <input type="radio" name="payment" value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="focus:ring-0" />
                <div>
                  <div className="font-medium" style={{ color: 'var(--theme-text)' }}>Cash on Delivery</div>
                  <div className="text-xs" style={{ color: 'var(--theme-text)', opacity: 0.5 }}>Pay when you receive</div>
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
                <button onClick={handleCODOrder}
                  disabled={processing || (!deliveryInfo && !cartShippingInfo)}
                  className="w-full py-3 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition text-sm uppercase tracking-widest text-white"
                  style={{ background: 'var(--theme-text)' }}
                >
                  {processing ? 'Processing...' : 'Place Order (COD)'}
                </button>
                <p className="text-[10px] text-center mt-4 uppercase tracking-widest"
                  style={{ color: 'var(--theme-text)', opacity: 0.3 }}
                >
                  Secure SSL Encryption - 30-day returns
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
