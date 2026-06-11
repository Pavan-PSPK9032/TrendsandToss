import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

const BANNERS = [
  { src: '/banner1.jpg', alt: 'Premium Jewellery Collection', title: 'Elegance Redefined', subtitle: 'Discover timeless pieces crafted for every occasion' },
  { src: '/banner2.jpg', alt: 'Exclusive Designs', title: 'Exclusive Designs', subtitle: 'Handpicked jewellery that speaks your style' },
  { src: '/banner3.jpg', alt: 'Luxury Collection', title: 'Luxury Collection', subtitle: 'Premium quality at unmatched prices' },
]

export default function BannerSlider() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState({})

  const next = useCallback(() => setCurrent(p => (p + 1) % BANNERS.length), [])

  const prev = useCallback(() => setCurrent(p => (p - 1 + BANNERS.length) % BANNERS.length), [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isPaused, next])

  useEffect(() => {
    const handleHover = () => setIsPaused(true)
    const handleLeave = () => {
      setTimeout(() => setIsPaused(false), 10000)
    }
    const el = document.getElementById('banner-slider')
    if (!el) return
    el.addEventListener('mouseenter', handleHover)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mouseenter', handleHover)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div id="banner-slider" className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden bg-gray-100">
      {BANNERS.map((banner, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-700 ${
            i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          {!imagesLoaded[i] && (
            <div className="absolute inset-0 skeleton" />
          )}
          <img
            src={banner.src}
            alt={banner.alt}
            className="w-full h-full object-cover"
            onLoad={() => setImagesLoaded(p => ({ ...p, [i]: true }))}
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchpriority={i === 0 ? 'high' : 'auto'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-10 md:bottom-16 left-0 right-0 text-center px-4 animate-fade-in-up">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-semibold text-white mb-3 drop-shadow-lg">
              {banner.title}
            </h2>
            <p className="text-sm md:text-lg text-white/80 mb-6 max-w-xl mx-auto drop-shadow">
              {banner.subtitle}
            </p>
            <Link
              to="/products"
              className="inline-block px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-105"
              style={{ background: 'var(--theme-primary)' }}
            >
              Shop Now
            </Link>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/30 backdrop-blur-sm transition-all text-white z-10">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/30 backdrop-blur-sm transition-all text-white z-10">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className="transition-all duration-300"
            style={{
              width: i === current ? '24px' : '8px',
              height: '8px',
              background: i === current ? 'var(--theme-primary)' : 'rgba(255,255,255,0.5)'
            }}
          />
        ))}
      </div>
    </div>
  )
}
