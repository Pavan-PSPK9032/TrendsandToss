import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getImageUrl } from '../utils/imageHelper'

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      loadProducts()
    } else {
      setQuery('')
      setResults([])
      setSuggestions([])
    }
  }, [isOpen])

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=200')
      setAllProducts(data.products || [])
    } catch {}
  }

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setResults([])
      return
    }
    setLoading(true)
    const q = query.toLowerCase()
    const filtered = allProducts.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.tags?.some?.(t => t.toLowerCase().includes(q))
    )
    setResults(filtered.slice(0, 8))
    setSuggestions(filtered.slice(0, 5))
    setLoading(false)
  }, [query, allProducts])

  const handleSelect = useCallback((product) => {
    onClose()
    navigate(`/product/${product._id}`)
  }, [onClose, navigate])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0])
    }
  }

  if (!isOpen) return null

  const getDiscount = (p) => {
    if (p.originalPrice && p.originalPrice > p.price) {
      return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
    }
    return 0
  }

  const suggestionsList = [...new Set(allProducts.map(p => p.category).filter(Boolean))]

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-2xl mx-auto mt-[15vh] px-4 animate-fade-in-up">
        <div className="bg-white shadow-2xl border border-gray-100 overflow-hidden">
          <div className="relative">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--theme-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products, categories, collections..."
              className="w-full pl-14 pr-12 py-5 text-lg border-b border-gray-100 focus:outline-none"
              style={{ color: 'var(--theme-text)', background: 'var(--card-bg)' }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--theme-text)', opacity: 0.3 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {!query && (
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>Browse Categories</p>
              <div className="flex flex-wrap gap-2">
                {suggestionsList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { onClose(); navigate(`/products?category=${encodeURIComponent(cat)}`) }}
                    className="px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--theme-text)' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="p-8 text-center">
              <div className="spinner mx-auto"></div>
            </div>
          )}

          {query && !loading && results.length > 0 && (
            <div className="max-h-[50vh] overflow-y-auto">
              {results.map(product => {
                const discount = getDiscount(product)
                return (
                  <button
                    key={product._id}
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center gap-4 p-4 transition-all duration-200 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-left"
                  >
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-50">
                      {product.images?.[0] ? (
                        <img
                          src={getImageUrl(product.images[0], 100)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: 'var(--theme-text)', opacity: 0.2 }}>No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-primary)' }}>{product.category}</p>
                      <p className="font-medium truncate mt-0.5" style={{ color: 'var(--theme-text)' }}>{product.name}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>₹{product.price}</span>
                        {discount > 0 && (
                          <>
                            <span className="text-xs line-through" style={{ color: '#6b7280' }}>₹{product.originalPrice}</span>
                            <span className="discount-badge text-[9px]">{discount}% OFF</span>
                          </>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--theme-text)', opacity: 0.2 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )
              })}
            </div>
          )}

          {query && !loading && results.length === 0 && (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--theme-text)', opacity: 0.1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>No results found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--theme-text)', opacity: 0.3 }}>Try searching for a different product or category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
