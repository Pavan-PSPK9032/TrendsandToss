import { Link } from 'react-router-dom';
import { useState } from 'react';
import { getImageUrl } from '../utils/imageHelper';

export default function ProductCard({ product }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      to={`/product/${product._id}`} 
      className="group block cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 relative">
        {/* Image Container */}
        <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {product.images.map((img, i) => (
            <img 
              key={i} 
              src={getImageUrl(img)} 
              className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ${
                i === currentImg ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`} 
            />
          ))}
          
          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Out of Stock
            </div>
          )}
          
          {/* Image Navigation Dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {product.images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImg(i);
                  }} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentImg 
                      ? 'bg-indigo-600 w-6' 
                      : 'bg-gray-400 hover:bg-gray-600'
                  }`} 
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-5">
          {/* Category Tag */}
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
            {product.category}
          </div>
          
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 leading-tight">
            {product.name}
          </h3>
          
          {/* Description */}
          <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          
          {/* Price & Stock */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ₹{product.price}
              </span>
            </div>
            <div className="text-xs font-medium">
              {product.stock > 0 ? (
                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  ✓ In Stock
                </span>
              ) : (
                <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  ✗ Sold Out
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Hover Overlay Effect */}
        <div className={`absolute inset-0 border-2 border-indigo-600 rounded-2xl transition-opacity duration-300 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>
    </Link>
  );
}