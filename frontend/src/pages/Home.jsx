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

const CATEGORY_ICONS = {
  'Necklaces': 'M12 2C8 2 4 5 4 9c0 3 2 5.5 4 7l4 6 4-6c2-1.5 4-4 4-7 0-4-4-7-8-7z',
  'Earrings': 'M12 1a3 3 0 00-3 3v2H7a2 2 0 000 4h2v2a3 3 0 006 0v-2h2a2 2 0 000-4h-2V4a3 3 0 00-3-3z',
  'Bracelets': 'M12 2C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V21l4-2 4 2v-6.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z',
  'Rings': 'M12 2C9.2 2 7 4.2 7 7c0 1.5.7 2.8 1.7 3.7L7 18c-.3 1 .3 2 1.3 2h7.4c1 0 1.6-1 1.3-2l-1.7-7.3c1-.9 1.7-2.2 1.7-3.7 0-2.8-2.2-5-5-5z',
  'Bangles': 'M12 2C7 2 4 5 4 9s2 6 4 8l4 5 4-5c2-2 4-4 4-8s-3-7-8-7z',
  'Sets': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
}

export default function Home() {
  const [categories, setCategories] = useState([])
  const [productsByCategory, setProductsByCategory] = useState({})
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products?limit=50')
      ])
      const cats = catRes.data.categories || []
      const products = prodRes.data.products || []

      setCategories(cats)
      setAllProducts(products)

      const grouped = {}
      cats.forEach(cat => { grouped[cat._id] = [] })
      products.forEach(p => {
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

  const featuredProducts = allProducts.filter(p => p.stock > 0).slice(0, 8)

  return (
    <div>
      {/* Hero Carousel */}
      <BannerSlider />

      {/* Category Grid */}
      {!loading && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10 mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map(cat => (
              <Link
                key={cat._id}
                to="/products"
                className="group bg-white border border-navy/10 p-4 sm:p-6 flex flex-col items-center text-center hover:border-gold hover:shadow-lg transition-all duration-300"
              >
                <svg className="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={CATEGORY_ICONS[cat.name] || 'M12 2l-1 9h-6l5 6-2 8 7-5 7 5-2-8 5-6h-6z'} />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-widest text-navy group-hover:text-gold transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Brand Story Strip */}
      <section className="bg-navy text-white py-16 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <svg className="w-8 h-8 mx-auto mb-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="font-playfair text-lg font-semibold mb-2">Authentic Craftsmanship</h3>
              <p className="text-white/50 text-sm leading-relaxed">Handpicked jewellery crafted by master artisans with generations of experience.</p>
            </div>
            <div>
              <svg className="w-8 h-8 mx-auto mb-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="font-playfair text-lg font-semibold mb-2">Premium Packaging</h3>
              <p className="text-white/50 text-sm leading-relaxed">Every piece arrives in an elegant gift box, ready to impress.</p>
            </div>
            <div>
              <svg className="w-8 h-8 mx-auto mb-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h3 className="font-playfair text-lg font-semibold mb-2">Easy Returns</h3>
              <p className="text-white/50 text-sm leading-relaxed">Free returns within 15 days. No questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {!loading && featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-navy whitespace-nowrap">Featured Pieces</h2>
            <div className="flex-1 h-px bg-gold/30"></div>
            <Link to="/products" className="text-xs font-semibold uppercase tracking-widest text-gold hover:text-gold-dark transition-colors whitespace-nowrap">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            <Suspense fallback={<ProductSkeleton />}>
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </Suspense>
          </div>
        </section>
      )}

      {/* Category Product Sections */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {[...Array(2)].map((_, i) => <CategorySkeleton key={i} />)}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {categories.map(category => {
            const catProducts = (productsByCategory[category._id] || []).slice(0, 8)
            if (catProducts.length === 0) return null

            return (
              <div key={category._id} className="mb-16">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-navy whitespace-nowrap">{category.name}</h2>
                  <div className="flex-1 h-px bg-gold/30"></div>
                  <Link to="/products" className="text-xs font-semibold uppercase tracking-widest text-gold hover:text-gold-dark transition-colors whitespace-nowrap">
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                  <Suspense fallback={<ProductSkeleton />}>
                    {catProducts.map(product => (
                      <ProductCard key={product._id} product={product} />
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
        </div>
      )}

      {/* Newsletter Section */}
      <section className="bg-navy/5 border-t border-navy/10 py-16 mt-8">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-navy mb-3">Join the Inner Circle</h2>
          <p className="text-navy/50 text-sm mb-6">Be the first to know about new collections, exclusive offers, and jewellery care tips.</p>
          <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm placeholder-navy/40"
            />
            <button className="bg-gold text-white px-6 py-3 font-semibold hover:bg-gold-dark transition text-sm uppercase tracking-widest whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
