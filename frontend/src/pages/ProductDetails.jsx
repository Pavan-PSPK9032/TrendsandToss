import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import ImageCarousel from '../components/ImageCarousel'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`)
      setProduct(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    try {
      await api.post('/cart/add', { productId: id, quantity: 1 })
      alert('Added to cart!')
    } catch (err) {
      alert('Please login to add items')
    }
  }

  if (loading) return <div className="text-center mt-20 text-slate-500">Loading details...</div>
  if (!product) return <div className="text-center mt-20 text-slate-500">Product not found</div>

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 transition mb-6 font-medium">
        ← Back to Collection
      </Link>
      
      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sm:p-10">
        <div>
          <ImageCarousel images={product.images} alt={product.name} height="h-[500px]" />
        </div>
        
        <div className="flex flex-col justify-center">
          <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-widest w-fit mb-4">
            {product.category}
          </span>
          <h1 className="text-4xl font-light text-slate-900 mb-4 tracking-tight">{product.name}</h1>
          <p className="text-3xl text-amber-600 font-light mb-6">₹{product.price}</p>
          <p className="text-slate-600 mb-8 leading-relaxed text-lg font-light">{product.description}</p>
          
          <div className="flex items-center gap-3 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium">Availability:</span>
            <span className={product.stock > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
              {product.stock > 0 ? `✓ ${product.stock} in stock` : '✕ Out of stock'}
            </span>
          </div>

          <button 
            onClick={addToCart}
            disabled={product.stock === 0}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-lg text-lg tracking-wide"
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
          
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span>Secure checkout • Premium packaging • 30-day returns</span>
          </div>
        </div>
      </div>
    </div>
  )
}