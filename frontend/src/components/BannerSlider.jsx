import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// 🔧 CONFIGURE YOUR BANNERS HERE - Add/Edit/Remove easily
const BANNERS = [
  {
    id: 1,
    image: '/banner1.jpg', // Save images in frontend/public/
    heading: 'Curated Luxury',
    subtitle: 'Premium essentials designed for the modern lifestyle',
    ctaText: 'Shop Now',
    ctaLink: '/products'
  },
  {
    id: 2,
    image: '/banner2.jpg',
    heading: 'Summer Collection',
    subtitle: 'Up to 50% off on selected items',
    ctaText: 'Explore',
    ctaLink: '/products'
  },
  {
    id: 3,
    image: '/banner3.jpg',
    heading: 'New Arrivals',
    subtitle: 'Discover the latest trends',
    ctaText: 'View Collection',
    ctaLink: '/products'
  }
]

export default function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume after 10s
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % BANNERS.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const currentBanner = BANNERS[currentIndex]

  return (
    <div 
      className="relative rounded-2xl overflow-hidden mb-10 shadow-2xl min-h-[450px] group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Banner Slides */}
      {BANNERS.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image */}
          <img
            src={banner.image}
            alt={banner.heading}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/85 to-slate-900/90"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-6xl font-light text-white tracking-tight mb-4 leading-tight">
                {banner.heading}
              </h1>
              <p className="text-slate-300 text-lg sm:text-xl font-light mb-8 max-w-xl mx-auto">
                {banner.subtitle}
              </p>
              <Link
                to={banner.ctaLink}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-8 py-3 rounded-full transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {banner.ctaText} →
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100 z-20"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100 z-20"
        aria-label="Next slide"
      >
        →
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-amber-500 w-8'
                : 'bg-white/50 hover:bg-white/80 w-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / BANNERS.length) * 100}%`
          }}
        />
      </div>
    </div>
  )
}