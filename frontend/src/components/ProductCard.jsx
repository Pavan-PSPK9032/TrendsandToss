import { Link } from 'react-router-dom';
import { useState } from 'react';
import { getImageUrl } from '../utils/imageHelper';

export default function ProductCard({ product }) {
  const [currentImg, setCurrentImg] = useState(0);

  return (
    <Link to={`/product/${product._id}`} className="block group cursor-pointer">
      <div className="border rounded-2xl p-4 shadow-sm hover:shadow-2xl transition-all duration-300 relative bg-white overflow-hidden hover:-translate-y-1">
        <div className="relative h-64 mb-3 overflow-hidden rounded-xl">
          {product.images.map((img, i) => (
            <img key={i} src={getImageUrl(img)} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === currentImg ? 'opacity-100' : 'opacity-0 group-hover:opacity-0'}`} />
          ))}
          {/* Hover dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {product.images.map((_, i) => (
              <button 
                key={i} 
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImg(i);
                }} 
                className={`w-2 h-2 rounded-full transition-all ${i === currentImg ? 'bg-white w-5' : 'bg-white/60 hover:bg-white'}`} 
              />
            ))}
          </div>
          {/* Price Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-sm font-bold text-slate-900 shadow-lg">
            ₹{product.price}
          </div>
        </div>
        <div className="p-2">
          <h3 className="font-semibold text-base text-slate-900 mb-1 truncate group-hover:text-amber-600 transition-colors">{product.name}</h3>
          <p className="text-slate-500 text-sm line-clamp-2 mb-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 capitalize bg-slate-100 px-2 py-1 rounded-full">
              {product.category}
            </span>
            <span className="text-xs text-slate-500">
              {product.stock > 0 ? '✓ In Stock' : '✗ Out of Stock'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}