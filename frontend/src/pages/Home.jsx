import { useState, useEffect, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import BannerSlider from '../components/BannerSlider'

// Lazy load ProductCard for better performance
const ProductCard = lazy(() => import('../components/ProductCard'))

// Skeleton loader component
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-navy/10 aspect-[3/4] mb-3"></div>
      <div className="h-4 bg-navy/10 mb-2"></div>
      <div className="h-3 bg-navy/10 w-2/3"></div>
    </div>
  )
}

function CategorySkeleton() {
  return (
    <div className="mb-12">
      <div className="h-8 bg-navy/10 w-48 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

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
      setLoading(true)
      
      // Fetch categories first
      const categoriesRes = await api.get('/categories')
      const cats = categoriesRes.data.categories
      setCategories(cats)

      // Fetch products for ALL categories in parallel (much faster!)
      const productPromises = cats.map(async (category) => {
        try {
          // Reduced limit to 8 for faster loading
          const productsRes = await api.get(`/categories/slug/${category.slug}/products?limit=8`)
          return { categoryId: category._id, products: productsRes.data.products }
        } catch (err) {
          console.error(`Error fetching products for ${category.name}:`, err)
          return { categoryId: category._id, products: [] }
        }
      })

      // Wait for all requests to complete simultaneously
      const results = await Promise.all(productPromises)
      
      // Build products map
      const productsData = {}
      results.forEach(({ categoryId, products }) => {
        productsData[categoryId] = products
      })

      setProductsByCategory(productsData)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(cat => {
    if (!searchTerm.trim()) return true
    const catProducts = productsByCategory[cat._id] || []
    return catProducts.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <BannerSlider />

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search jewellery..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 bg-white border border-navy/20 focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none transition text-navy placeholder-navy/40 text-sm tracking-wide"
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div>
          {[...Array(2)].map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Categories with Products */}
          {filteredCategories.map(category => {
            const categoryProducts = (productsByCategory[category._id] || []).filter(p =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              p.description.toLowerCase().includes(searchTerm.toLowerCase())
            )

            if (categoryProducts.length === 0) return null

            return (
              <div key={category._id} className="mb-14">
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-navy">{category.name}</h2>
                  <div className="flex-1 h-px bg-gold/30"></div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                  <Suspense fallback={<ProductSkeleton />}>
                    {categoryProducts.map(product => (
                      <div key={product._id}>
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </Suspense>
                </div>
              </div>
            )
          })}

          {filteredCategories.length === 0 && (
            <div className="text-center mt-20 text-navy/40">
              <p className="text-xl font-light tracking-wide">No products found</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
