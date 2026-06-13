import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import ImageCarousel from '../components/ImageCarousel'
import ImageModal from '../components/ImageModal'
import ReviewSection from '../components/ReviewSection'
import toast from 'react-hot-toast'
import { useLoginPrompt } from '../context/LoginPromptContext'
import { auth } from '../config/firebase'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showLoginPrompt } = useLoginPrompt()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
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
    if (!auth.currentUser) { showLoginPrompt('Login to add items to your cart'); return }
    try {
      await api.post('/cart/add', { productId: id, quantity: 1 })
      toast.success('Added to cart!')
    } catch (err) {
      toast.error('Failed to add to cart')
    }
  }

  const buyNow = async () => {
    if (!auth.currentUser) { showLoginPrompt('Login to continue with purchase'); return }
    try {
      await api.post('/cart/add', { productId: id, quantity: 1 })
      navigate('/cart')
    } catch (err) {
      toast.error('Failed to proceed')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-2 gap-0 border" style={{ borderColor: 'var(--border)' }}>
          <div className="skeleton h-[500px]" />
          <div className="p-8 lg:p-12 space-y-6">
            <div className="skeleton h-6 w-24" />
            <div className="skeleton h-12 w-3/4" />
            <div className="skeleton h-10 w-1/3" />
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-14 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return (
    <div className="text-center mt-20" style={{ color: 'var(--theme-text)', opacity: 0.5 }}>
      Product not found
    </div>
  )

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const savings = product.originalPrice - product.price

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/products" className="inline-flex items-center gap-2 transition mb-6 text-sm tracking-wide group"
        style={{ color: 'var(--theme-text)', opacity: 0.5 }}
      >
        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Collection
      </Link>
      
      <div className="overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="grid lg:grid-cols-2 gap-0">
          <div className="p-8 lg:p-12" style={{ background: 'var(--bg-secondary)' }}>
            <div 
              className="cursor-pointer group relative"
              onClick={() => {
                setCurrentImageIndex(0);
                setShowImageModal(true);
              }}
            >
              <ImageCarousel images={product.images} alt={product.name} height="h-[500px]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white px-4 py-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ background: 'var(--theme-text)' }}
                >
                  Click to enlarge
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <div
              className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest w-fit mb-4 border"
              style={{
                color: 'var(--theme-primary)',
                borderColor: 'var(--theme-primary)'
              }}
            >
              {product.category}
            </div>
            
            <h1 className="font-heading text-4xl lg:text-5xl font-semibold mb-4 leading-tight"
              style={{ color: 'var(--theme-text)' }}
            >
              {product.name}
            </h1>
            
            {/* === PRICE SECTION - UPDATED === */}
            <div className="flex items-baseline gap-3 mb-2">
              <p className="text-4xl font-bold" style={{ color: 'var(--theme-primary)' }}>₹{product.price}</p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-xl line-through" style={{ color: '#6b7280' }}>₹{product.originalPrice}</p>
              )}
              {discount > 0 && (
                <span className="discount-badge text-sm px-3 py-1">{discount}% OFF</span>
              )}
            </div>
            {savings > 0 && (
              <p className="text-sm mb-6" style={{ color: 'var(--theme-text)', opacity: 0.5 }}>
                MRP <span className="line-through">₹{product.originalPrice}</span> | You save <span className="font-semibold" style={{ color: '#16a34a' }}>₹{savings}</span>
              </p>
            )}
            
            <div className="mb-6">
              <p className="leading-relaxed text-sm md:text-base whitespace-pre-line"
                style={{ color: 'var(--theme-text)', opacity: 0.7 }}
              >
                {product.description}
              </p>
            </div>
            
            <div className="flex items-center gap-3 mb-8 p-4 border"
              style={{
                background: product.stock > 0 ? 'var(--bg-secondary)' : '#fef2f2',
                borderColor: product.stock > 0 ? 'var(--border)' : '#fecaca'
              }}
            >
              <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>Availability:</span>
              {product.stock > 3 ? (
                <span className="font-bold text-sm flex items-center gap-1" style={{ color: '#16a34a' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  In Stock
                </span>
              ) : product.stock > 0 ? (
                <span className="font-bold text-sm flex items-center gap-1" style={{ color: '#ea580c' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Only {product.stock} left
                </span>
              ) : (
                <span className="font-bold text-sm flex items-center gap-1" style={{ color: '#dc2626' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Out of Stock
                </span>
              )}
            </div>

            {product.stock === 0 && (
              <div className="mb-6 p-4 border text-sm font-medium text-center"
                style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}
              >
                This item is currently out of stock.
              </div>
            )}

            <div className="flex gap-3 mb-6">
              <button 
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 py-4 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition text-sm uppercase tracking-widest"
                style={{
                  background: 'var(--theme-text)',
                  color: product.stock > 0 ? '#fff' : undefined
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add to Cart
                </span>
              </button>
              <button 
                onClick={buyNow}
                disabled={product.stock === 0}
                className="flex-1 py-4 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition text-sm uppercase tracking-widest text-white"
                style={{
                  background: 'var(--theme-primary)',
                  opacity: product.stock === 0 ? 0.4 : undefined
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Buy Now
                </span>
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-3 border" style={{ borderColor: 'var(--border)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs font-medium text-center uppercase tracking-wide" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>Secure Pay</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 border" style={{ borderColor: 'var(--border)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-xs font-medium text-center uppercase tracking-wide" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>Premium</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 border" style={{ borderColor: 'var(--border)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-xs font-medium text-center uppercase tracking-wide" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ReviewSection productId={id} />
      
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
