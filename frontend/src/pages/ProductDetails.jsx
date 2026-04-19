import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import ImageCarousel from '../components/ImageCarousel'
import ImageModal from '../components/ImageModal'
import ReviewSection from '../components/ReviewSection'
import toast from 'react-hot-toast'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
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

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading details...</div>
  if (!product) return <div className="text-center mt-20 text-gray-500">Product not found</div>

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition mb-6 font-medium group">
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Collection
      </Link>
      
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Image Section - Clickable */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12">
            <div 
              className="cursor-pointer group relative"
              onClick={() => {
                setCurrentImageIndex(0);
                setShowImageModal(true);
              }}
            >
              <ImageCarousel images={product.images} alt={product.name} height="h-[500px]" />
              
              {/* Click to enlarge hint */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Click to enlarge
                </div>
              </div>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="flex flex-col justify-center p-8 lg:p-12">
            {/* Category */}
            <div className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest w-fit mb-4">
              {product.category}
            </div>
            
            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <p className="text-5xl font-bold text-gray-900">₹{product.price}</p>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <p className="text-2xl text-gray-400 line-through">₹{product.originalPrice}</p>
                  <span className="text-lg font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            
            {/* Description - Mobile Optimized */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed text-base md:text-lg whitespace-pre-line">
                {product.description}
              </p>
            </div>
            
            {/* Availability */}
            <div className="flex items-center gap-3 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-gray-600 font-medium">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {product.stock} in stock
                </span>
              ) : (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Out of stock
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button 
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg text-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Reserve Now
                </span>
              </button>
              <button 
                onClick={buyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition shadow-lg text-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Step Into Style
                </span>
              </button>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs text-gray-700 font-medium text-center">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-xs text-gray-700 font-medium text-center">Premium Quality</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-xs text-gray-700 font-medium text-center">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <ReviewSection productId={id} />
      
      {/* Full-Screen Image Modal */}
      {showImageModal && (
        <ImageModal
          images={product.images}
          currentIndex={currentImageIndex}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  )
}