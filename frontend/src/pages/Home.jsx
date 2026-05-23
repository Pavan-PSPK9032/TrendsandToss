import { useState, useEffect, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import BannerSlider from '../components/BannerSlider'

const ProductCard = lazy(() => import('../components/ProductCard'))

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

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      // Fetch categories and all products in parallel — just 2 calls
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products?limit=50')
      ])
      const cats = catRes.data.categories
      const allProducts = prodRes.data.products || []

      setCategories(cats)

      // Group products by category name client-side
      const grouped = {}
      cats.forEach(cat => { grouped[cat._id] = [] })
      allProducts.forEach(p => {
        // Find matching category by name
        const match = cats.find(c => c.name === p.category)
        if (match && grouped[match._id]) {
          grouped[match._id].push(p)
        }
      })
      setProductsByCategory(grouped)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <BannerSlider />

      {/* Loading State */}
      {loading ? (
        <div>
          {[...Array(2)].map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {categories.map(category => {
            const categoryProducts = productsByCategory[category._id] || []
            if (categoryProducts.length === 0) return null

            return (
              <div key={category._id} className="mb-14">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-navy">{category.name}</h2>
                  <div className="flex-1 h-px bg-gold/30"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                  <Suspense fallback={<ProductSkeleton />}>
                    {categoryProducts.slice(0, 8).map(product => (
                      <div key={product._id}>
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </Suspense>
                </div>
              </div>
            )
          })}

          {categories.length === 0 && (
            <div className="text-center mt-20 text-navy/40">
              <p className="text-xl font-light tracking-wide">No products found</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
