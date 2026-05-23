import { useState } from 'react'
import { getImageUrl } from '../utils/imageHelper'

export default function ImageCarousel({ images = [], alt = 'Product', height = 'h-64' }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return <div className={`bg-navy/5 ${height} flex items-center justify-center text-navy/30 text-sm`}>No Image</div>
  }

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % images.length)
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  const goToSlide = (index) => setCurrentIndex(index)

  return (
    <div className="relative group">
      <div className={`overflow-hidden bg-white border border-navy/10 ${height}`}>
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
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-navy/60 text-white p-2 hover:bg-navy/80 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={goToNext} 
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-navy/60 text-white p-2 hover:bg-navy/80 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          <div className="flex justify-center gap-2 mt-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-1 transition-all duration-300 ${idx === currentIndex ? 'bg-gold w-4' : 'bg-navy/20 w-1.5 hover:bg-navy/40'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}