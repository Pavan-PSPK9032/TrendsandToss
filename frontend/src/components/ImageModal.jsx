import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageHelper';

export default function ImageModal({ images, currentIndex, onClose }) {
  const [currentImg, setCurrentImg] = useState(currentIndex);
  const [scale, setScale] = useState(1);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Reset scale when image changes
  useEffect(() => {
    setScale(1);
  }, [currentImg]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentImg < images.length - 1) {
      setCurrentImg(currentImg + 1);
    }
    if (isRightSwipe && currentImg > 0) {
      setCurrentImg(currentImg - 1);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));

  const goToPrev = () => {
    if (currentImg > 0) setCurrentImg(currentImg - 1);
  };

  const goToNext = () => {
    if (currentImg < images.length - 1) setCurrentImg(currentImg + 1);
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
        {currentImg + 1} / {images.length}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); zoomOut(); }}
          className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition disabled:opacity-50"
          disabled={scale <= 1}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h6" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); zoomIn(); }}
          className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition disabled:opacity-50"
          disabled={scale >= 3}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            disabled={currentImg === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            disabled={currentImg === images.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Main Image */}
      <div
        className="w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={getImageUrl(images[currentImg])}
          alt={`Product image ${currentImg + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
        />
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-50 flex justify-center gap-2 px-4 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                i === currentImg ? 'border-white' : 'border-transparent opacity-60'
              }`}
            >
              <img
                src={getImageUrl(img)}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
