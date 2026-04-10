import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import BannerSlider from '../components/BannerSlider'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [productsByCategory, setProductsByCategory] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesRes = await api.get('/categories')
      const cats = categoriesRes.data.categories

      // Fetch products for each category
      const productsData = {}
      for (const category of cats) {
        try {
          const productsRes = await api.get(`/categories/slug/${category.slug}/products?limit=20`)
          productsData[category._id] = productsRes.data.products
        } catch (err) {
          productsData[category._id] = []
        }
      }

      setCategories(cats)
      setProductsByCategory(productsData)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const allProducts = Object.values(productsByCategory).flat()
  const filteredCategories = categories.filter(cat => {
    const catProducts = productsByCategory[cat._id] || []
    return catProducts.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading collection...</div>

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <BannerSlider />

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Categories with Products */}
      {filteredCategories.map(category => {
        const categoryProducts = (productsByCategory[category._id] || []).filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (categoryProducts.length === 0) return null

        return (
          <div key={category._id} className="mb-12">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-6">
              {category.icon && <span className="text-3xl">{category.icon}</span>}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
            </div>

            {/* Products - Horizontal scroll on mobile, grid on desktop */}
            <div className="md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:overflow-visible overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none pb-4">
              {categoryProducts.map(product => (
                <div key={product._id} className="md:w-auto w-[280px] flex-shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {filteredCategories.length === 0 && (
        <div className="text-center mt-20 text-gray-500">
          <p className="text-xl font-light">No products found</p>
        </div>
      )}
    </div>
  )
}
