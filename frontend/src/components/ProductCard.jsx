import { Link } from 'react-router-dom';
import { useState } from 'react';
import { getImageUrl } from '../utils/imageHelper';

export default function ProductCard({ product }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Touch handling for swipe
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

    if (isLeftSwipe && currentImg < product.images.length - 1) {
      setCurrentImg(currentImg + 1);
    }
    if (isRightSwipe && currentImg > 0) {
      setCurrentImg(currentImg - 1);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <Link 
      to={`/product/${product._id}`} 
      className="group block"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 active:scale-95">
        {/* Image Container with Swipe Support */}
        <div 
          className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {product.images.map((img, i) => (
            <img 
              key={i} 
              src={getImageUrl(img)} 
              className={`absolute inset-0 w-full h-full object-contain p-3 transition-all duration-300 ${
                i === currentImg ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`} 
              alt={`${product.name} - Image ${i + 1}`}
              loading="lazy"
            />
          ))}
          
          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
              Sold Out
            </div>
          )}
          
          {/* Image Navigation Dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {product.images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentImg 
                      ? 'bg-indigo-600 w-4' 
                      : 'bg-gray-400 w-1.5'
                  }`} 
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info - Mobile Optimized */}
        <div className="p-3">
          {/* Product Name */}
          <h3 className="font-medium text-gray-900 text-sm mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
            {product.name}
          </h3>
          
          {/* Price & Stock */}
          <div className="flex items-start justify-between gap-1">
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xs sm:text-sm text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 sm:px-1.5 py-0.5 rounded whitespace-nowrap">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>
            {product.stock > 0 ? (
              <span className="text-[9px] sm:text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                In Stock
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-medium text-red-600 bg-red-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
