import { useState, useRef } from 'react'
import { getImageUrl } from '../utils/imageHelper'

export default function ImageCarousel({ images = [], alt = 'Product', height = 'h-64' }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const imgRef = useRef(null)

  if (!images || images.length === 0) {
    return <div className={`bg-navy/5 ${height} flex items-center justify-center text-navy/30 text-sm`}>No Image</div>
  }

  const validImages = images.filter(Boolean)
  if (validImages.length === 0) {
    return <div className={`bg-navy/5 ${height} flex items-center justify-center text-navy/30 text-sm`}>No Image</div>
  }

  const handleMouseMove = (e) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % validImages.length)
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  const goToSlide = (index) => setCurrentIndex(index)

  return (
    <div className="relative group">
      <div
        ref={imgRef}
        className={`overflow-hidden bg-white border border-navy/10 ${height} cursor-zoom-in`}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={getImageUrl(validImages[currentIndex])}
          alt={`${alt} - ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-100"
          style={{
            transform: zoom ? 'scale(2)' : 'scale(1)',
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
          }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </div>

      {zoom && (
        <div className="absolute top-3 right-3 bg-navy/70 text-white text-xs font-semibold uppercase tracking-wider px-2.5 py-1 pointer-events-none">
          Zoom
        </div>
      )}

      {validImages.length > 1 && (
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
            {validImages.map((_, idx) => (
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