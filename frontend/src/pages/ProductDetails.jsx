import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import ImageCarousel from '../components/ImageCarousel'
import toast from 'react-hot-toast'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pincode, setPincode] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [checkingDelivery, setCheckingDelivery] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`)
      setProduct(data)
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    try {
      await api.post('/cart/add', { productId: id, quantity: 1 })
      toast.success('Added to cart!')
    } catch (err) {
      toast.error('Please login to add items')
    }
  }

  const buyNow = async () => {
    try {
      await api.post('/cart/add', { productId: id, quantity: 1 })
      navigate('/checkout')
    } catch (err) {
      toast.error('Please login to continue')
    }
  }

  const checkDelivery = async () => {
    if (pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode')
      return
    }
    
    setCheckingDelivery(true)
    try {
      console.log('Checking pincode:', pincode)
      const { data } = await api.get(`/shipping/check/${pincode}`)
      console.log('Delivery response:', data)
      setDeliveryInfo(data)
      if (data.available) {
        toast.success('Delivery available!')
      } else {
        toast.error(data.message || 'Delivery not available')
      }
    } catch (err) {
      console.error('Delivery check error:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to check delivery. Please try again.'
      toast.error(errorMsg)
    } finally {
      setCheckingDelivery(false)
    }
  }

  if (loading) return <div className="text-center mt-20 text-slate-500">Loading details...</div>
  if (!product) return <div className="text-center mt-20 text-slate-500">Product not found</div>

  const freeDeliveryThreshold = 500
  const isFreeDelivery = product.price >= freeDeliveryThreshold
  const deliveryCharge = deliveryInfo?.charge || (isFreeDelivery ? 0 : 50)

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <Link to="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 transition mb-6 font-medium">
        ← Back to Collection
      </Link>
      
      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Image Section */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-white">
          <ImageCarousel images={product.images} alt={product.name} height="h-[500px]" />
        </div>
        
        {/* Details Section */}
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest w-fit mb-4">
            {product.category}
          </span>
          
          <h1 className="text-4xl font-light text-slate-900 mb-4 tracking-tight">{product.name}</h1>
          
          <div className="flex items-baseline gap-3 mb-6">
            <p className="text-4xl text-amber-600 font-light">₹{product.price}</p>
            {isFreeDelivery && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                FREE Delivery
              </span>
            )}
          </div>
          
          <p className="text-slate-600 mb-8 leading-relaxed text-lg font-light">{product.description}</p>
          
          {/* Availability */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium">Availability:</span>
            <span className={product.stock > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
              {product.stock > 0 ? `✓ ${product.stock} in stock` : '✕ Out of stock'}
            </span>
          </div>

          {/* Pincode Check */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Check Delivery Availability
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit pincode"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                maxLength={6}
              />
              <button
                onClick={checkDelivery}
                disabled={checkingDelivery}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition font-medium"
              >
                {checkingDelivery ? 'Checking...' : 'Check'}
              </button>
            </div>
            {deliveryInfo && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${
                deliveryInfo.available ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {deliveryInfo.available ? (
                  <div>
                    <p className="font-semibold">✓ Delivery Available</p>
                    <p className="mt-1">
                      {isFreeDelivery || product.price >= freeDeliveryThreshold 
                        ? 'FREE delivery on this order!' 
                        : `Delivery charge: ₹${deliveryCharge}`}
                    </p>
                    <p className="mt-1 text-xs opacity-75">FREE delivery on orders above ₹{freeDeliveryThreshold}</p>
                  </div>
                ) : (
                  <p className="font-semibold">✕ {deliveryInfo.message || 'Delivery not available'}</p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button 
              onClick={addToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-lg text-lg tracking-wide"
            >
              Add to Cart
            </button>
            <button 
              onClick={buyNow}
              disabled={product.stock === 0}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition shadow-lg text-lg tracking-wide"
            >
              Buy Now
            </button>
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-lg">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[10px] text-slate-600 text-center">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-[10px] text-slate-600 text-center">Premium Packaging</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-[10px] text-slate-600 text-center">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}