import { useState, useEffect } from 'react'

const BANNERS = [
  {
    id: 1,
    image: '/banner1.jpg',
    title: 'Elegant Jewellery',
    subtitle: 'Discover timeless designs crafted for every occasion'
  },
  {
    id: 2,
    image: '/banner2.jpg',
    title: 'New Arrivals',
    subtitle: 'Explore our latest collections'
  },
  {
    id: 3,
    image: '/banner3.jpg',
    title: 'Premium Collection',
    subtitle: 'Handcrafted with precision and passion'
  }
]

export default function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState('next')

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setDirection('next')
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 'next' : 'prev')
    setCurrentIndex(index)
    pauseAutoPlay()
  }

  const goToPrevious = () => {
    setDirection('prev')
    setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)
    pauseAutoPlay()
  }

  const goToNext = () => {
    setDirection('next')
    setCurrentIndex((prev) => (prev + 1) % BANNERS.length)
    pauseAutoPlay()
  }

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <div
      className="relative overflow-hidden group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[550px]">
        {BANNERS.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/20 to-transparent" />

            <div
              className={`absolute bottom-10 md:bottom-16 left-6 md:left-12 right-6 md:right-12 max-w-xl transition-all duration-700 delay-300 ${
                index === currentIndex
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              }`}
            >
              <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight mb-3">
                {banner.title}
              </h2>
              <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-md font-light leading-relaxed">
                {banner.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white border border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white border border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-500 ${
              index === currentIndex
                ? 'bg-gold w-8 md:w-10 h-1'
                : 'bg-white/40 hover:bg-white/70 w-2 h-1'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}