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
      <div className="bg-white overflow-hidden border border-navy/10 hover:border-gold transition-all duration-300 active:scale-95 group-hover:shadow-lg">
        {/* Image Container */}
        <div 
          className="relative aspect-square overflow-hidden bg-gray-50"
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
            <div className="absolute top-2 left-2 bg-navy text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
              Sold Out
            </div>
          )}
          
          {/* Image Navigation Dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {product.images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 transition-all duration-300 ${
                    i === currentImg 
                      ? 'bg-gold w-4' 
                      : 'bg-navy/30 w-1.5'
                  }`} 
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-3 border-t border-navy/5">
          <h3 className="font-medium text-navy text-sm mb-1.5 line-clamp-2 group-hover:text-gold transition-colors leading-snug">
            {product.name}
          </h3>
          
          <div className="flex items-start justify-between gap-1">
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-bold text-navy">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xs sm:text-sm text-navy/40 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-white bg-gold px-1 sm:px-1.5 py-0.5 whitespace-nowrap">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>
            {product.stock > 0 ? (
              <span className="text-[9px] sm:text-[10px] font-medium text-gold border border-gold/40 px-1.5 sm:px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                In Stock
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-medium text-red-600 border border-red-200 px-1.5 sm:px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
