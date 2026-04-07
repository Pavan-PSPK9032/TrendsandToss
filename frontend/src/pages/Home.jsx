import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ImageCarousel from '../components/ImageCarousel'
import BannerSlider from '../components/BannerSlider'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'electronics', 'clothing', 'men', 'women', 'accessories', 'home']

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products')
      setProducts(data.products)
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId) => {
    try {
      await api.post('/cart/add', { productId, quantity: 1 })
      alert('Added to cart!')
    } catch (err) {
      alert('Please login to add items to cart')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) return <div className="text-center mt-20 text-slate-500">Loading collection...</div>

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <BannerSlider />

      <div className="mb-8">
        <input
          type="text"
          placeholder="🔍 Search collection..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none transition text-slate-800 placeholder-slate-400"
        />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 mb-10 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-all font-medium tracking-wide ${
              selectedCategory === cat
                ? 'bg-amber-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-500 hover:text-amber-600'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map(product => (
          <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="relative">
              <ImageCarousel images={product.images} alt={product.name} height="h-72" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                ₹{product.price}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-medium text-lg text-slate-900 mb-2 truncate group-hover:text-amber-600 transition-colors">{product.name}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="flex gap-3">
                <Link to={`/product/${product._id}`} className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-center hover:bg-slate-800 transition font-medium">View Details</Link>
                <button onClick={() => addToCart(product._id)} className="flex-1 bg-amber-500 text-white py-2.5 rounded-xl hover:bg-amber-600 transition font-medium shadow-md">Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center mt-20 text-slate-500">
          <p className="text-xl font-light">No items match your search</p>
        </div>
      )}

     
    </div>
  )
}