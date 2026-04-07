import { useState } from 'react'
import { getImageUrl } from '../utils/imageHelper'

export default function ImageCarousel({ images = [], alt = 'Product', height = 'h-64' }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return <div className={`bg-gray-200 ${height} flex items-center justify-center rounded-lg`}>No Image</div>
  }

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % images.length)
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  const goToSlide = (index) => setCurrentIndex(index)

  return (
    <div className="relative group">
      <div className={`overflow-hidden rounded-lg bg-white shadow-sm ${height}`}>
        <img
          src={getImageUrl(images[currentIndex])}
          alt={`${alt} - ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
        />
      </div>

      {images.length > 1 && (
        <>
          <button 
            onClick={goToPrev} 
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ◀
          </button>
          <button 
            onClick={goToNext} 
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ▶
          </button>

          <div className="flex justify-center gap-2 mt-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-300 w-2 hover:bg-gray-400'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}