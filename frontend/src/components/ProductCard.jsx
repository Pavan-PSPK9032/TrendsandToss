import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageHelper';

function isNewProduct(createdAt) {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays <= 14;
}

export default function ProductCard({ product, view = 'grid' }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('tt_wishlist') || '[]');
    setWishlisted(wishlist.includes(product._id));
  }, [product._id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('tt_wishlist') || '[]');
    const updated = wishlisted
      ? wishlist.filter(id => id !== product._id)
      : [...wishlist, product._id];
    localStorage.setItem('tt_wishlist', JSON.stringify(updated));
    setWishlisted(!wishlisted);
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const badges = [];
  if (discount > 0) badges.push({ label: `${discount}% OFF`, type: 'sale' });
  if (isNewProduct(product.createdAt)) badges.push({ label: 'NEW', type: 'new' });
  if (product.stock > 20) badges.push({ label: 'TRENDING', type: 'trending' });

  const isGrid = view === 'grid';

  return (
    <Link
      to={`/product/${product._id}`}
      className={`group block ${isGrid ? '' : 'flex gap-4'}`}
    >
      <div className={`relative overflow-hidden bg-gray-50 border border-navy/10 group-hover:border-gold transition-all duration-500 ${isGrid ? 'w-full aspect-[3/4]' : 'w-40 h-48 flex-shrink-0'}`}>
        <div
          className={`absolute inset-0 transition-transform duration-700 group-hover:scale-105 ${imageLoaded ? '' : 'opacity-0'}`}
        >
          {product.images.map((img, i) => (
            <img
              key={i}
              src={getImageUrl(img, 400)}
              onLoad={() => i === 0 && setImageLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                i === currentImg ? 'opacity-100' : 'opacity-0'
              }`}
              alt={`${product.name} - Image ${i + 1}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchpriority={i === 0 ? 'high' : 'auto'}
            />
          ))}
        </div>

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}

        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className={`w-4 h-4 transition-colors ${wishlisted ? 'text-gold fill-gold' : 'text-navy'}`}
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {badges.map((badge, i) => (
              <span
                key={i}
                className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 ${
                  badge.type === 'sale' ? 'bg-gold text-white' :
                  badge.type === 'new' ? 'bg-navy text-white' :
                  'bg-white text-navy border border-navy/20'
                }`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-navy font-bold text-sm uppercase tracking-widest border-2 border-navy px-4 py-2">Sold Out</span>
          </div>
        )}

        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, i) => (
              <div
                key={i}
                className={`h-1 transition-all duration-300 ${
                  i === currentImg ? 'bg-gold w-5' : 'bg-white/60 w-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className={`${isGrid ? 'pt-4' : 'flex-1'}`}>
        {product.category && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">
            {product.category}
          </p>
        )}
        <h3 className={`font-playfair text-navy group-hover:text-gold transition-colors leading-tight ${
          isGrid ? 'text-sm md:text-base' : 'text-base'
        }`}>
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-navy text-sm md:text-base">
            Rs.{product.price}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-navy/40 line-through">
              Rs.{product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
