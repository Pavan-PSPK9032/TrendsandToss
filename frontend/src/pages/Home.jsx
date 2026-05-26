import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import BannerSlider from '../components/BannerSlider'

const CATEGORY_IMAGES = {
  'Necklaces': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=700&fit=crop&auto=format',
  'Earrings': 'https://images.unsplash.com/photo-1535632066927-ab7b248e8aa9?w=600&h=700&fit=crop&auto=format',
  'Rings': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=700&fit=crop&auto=format',
  'Bracelets': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=700&fit=crop&auto=format',
  'Bangles': 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=700&fit=crop&auto=format',
  'Sets': 'https://images.unsplash.com/photo-1515562141589-67f0216f8c5a?w=600&h=700&fit=crop&auto=format',
}

const FALLBACK_ICONS = {
  'Necklaces': 'M12 2C8 2 4 5 4 9c0 3 2 5.5 4 7l4 6 4-6c2-1.5 4-4 4-7 0-4-4-7-8-7z',
  'Earrings': 'M12 1a3 3 0 00-3 3v2H7a2 2 0 000 4h2v2a3 3 0 006 0v-2h2a2 2 0 000-4h-2V4a3 3 0 00-3-3z',
  'Bracelets': 'M12 2C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V21l4-2 4 2v-6.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z',
  'Rings': 'M12 2C9.2 2 7 4.2 7 7c0 1.5.7 2.8 1.7 3.7L7 18c-.3 1 .3 2 1.3 2h7.4c1 0 1.6-1 1.3-2l-1.7-7.3c1-.9 1.7-2.2 1.7-3.7 0-2.8-2.2-5-5-5z',
  'Bangles': 'M12 2C7 2 4 5 4 9s2 6 4 8l4 5 4-5c2-2 4-4 4-8s-3-7-8-7z',
  'Sets': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
}

function CategoryCard({ cat }) {
  const [imgError, setImgError] = useState(false)
  const imgUrl = cat.image || CATEGORY_IMAGES[cat.name]

  return (
    <Link
      to={`/products?category=${encodeURIComponent(cat.name)}`}
      className="group relative block overflow-hidden bg-white border border-navy/10 hover:border-gold hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
    >
      <div className="aspect-[3/4] overflow-hidden">
        {!imgError && imgUrl ? (
          <img
            src={imgUrl}
            alt={cat.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-navy/5 p-8">
            <svg className="w-12 h-12 text-gold mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={FALLBACK_ICONS[cat.name] || 'M12 2l-1 9h-6l5 6-2 8 7-5 7 5-2-8 5-6h-6z'} />
            </svg>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-white bg-gold px-3 py-1.5 group-hover:bg-navy transition-colors duration-300">
          {cat.name}
        </span>
      </div>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </Link>
  )
}

export default function Home() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const catRes = await api.get('/categories')
      setCategories(catRes.data.categories || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <BannerSlider />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 mb-20 md:mb-28">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <h2 className="font-playfair text-2xl md:text-3xl text-navy font-semibold tracking-tight">Shop by Category</h2>
          <Link to="/products" className="text-xs font-semibold uppercase tracking-[0.2em] text-gold hover:text-gold-dark transition-colors">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-navy/5 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categories.map(cat => (
              <CategoryCard key={cat._id} cat={cat} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
