import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import BannerSlider from '../components/BannerSlider'

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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10 mb-16">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-navy/5 p-6 flex flex-col items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-navy/10"></div>
                <div className="h-3 bg-navy/10 w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map(cat => (
              <Link
                key={cat._id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
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
        )}
      </section>
    </div>
  )
}
