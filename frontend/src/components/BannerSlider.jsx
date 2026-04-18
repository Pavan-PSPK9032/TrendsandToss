import { useState, useEffect } from 'react'

// 🔧 CONFIGURE YOUR BANNERS HERE - Add/Edit/Remove easily
const BANNERS = [
  {
    id: 1,
    image: '/banner1.jpg' // Save images in frontend/public/
  },
  {
    id: 2,
    image: '/banner2.jpg'
  },
  {
    id: 3,
    image: '/banner3.jpg'
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
          {/* Banner Image */}
          <img
            src={banner.image}
            alt={`Banner ${banner.id}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Navigation Arrows - Only show on hover */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
        aria-label="Next slide"
      >
        →
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/80 w-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}