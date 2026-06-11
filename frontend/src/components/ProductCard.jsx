import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageHelper';
import { useAuth } from '../context/AuthContext';

function isNewProduct(createdAt) {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays <= 14;
}

export default function ProductCard({ product, view = 'grid' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  if (isNewProduct(product.createdAt)) badges.push({ label: 'NEW', type: 'new' });
  if (product.stock > 20) badges.push({ label: 'TRENDING', type: 'trending' });

  const isGrid = view === 'grid';

  return (
    <Link
      to={`/product/${product._id}`}
      className={`group block ${isGrid ? '' : 'flex gap-4'}`}
    >
      <div className={`relative overflow-hidden product-card ${isGrid ? 'w-full aspect-[3/4]' : 'w-40 h-48 flex-shrink-0'}`}
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <div
          className={`absolute inset-0 transition-transform duration-700 group-hover:scale-105 ${imageLoaded ? '' : 'opacity-0'}`}
        >
          {product.images.filter(Boolean).map((img, i) => (
            <img
              key={i}
              src={getImageUrl(img, 400)}
              onLoad={() => i === 0 && setImageLoaded(true)}
              onError={() => i === 0 && setImageLoaded(false)}
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
          <div className="absolute inset-0 skeleton" />
        )}

        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className={`w-4 h-4 transition-colors ${wishlisted ? 'text-gold fill-gold' : ''}`}
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke={wishlisted ? 'currentColor' : 'currentColor'}
            viewBox="0 0 24 24"
            style={!wishlisted ? { color: 'var(--theme-text)' } : {}}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {badges.map((badge, i) => (
              <span
                key={i}
                className="text-[9px] font-bold uppercase tracking-widest px-2 py-1"
                style={{
                  background: badge.type === 'new' ? 'var(--theme-primary)' : 'rgba(255,255,255,0.9)',
                  color: badge.type === 'new' ? '#fff' : 'var(--theme-text)',
                  border: badge.type !== 'new' ? '1px solid var(--border)' : 'none'
                }}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {user?.role === 'admin' && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/admin/products', { state: { editProductId: product._id } }); }}
            className="absolute bottom-3 right-3 z-10 w-8 h-8 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            title="Edit product"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gray-200/70 flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase tracking-[0.15em] px-3 py-1.5" style={{ background: 'var(--theme-text)' }}>Out of Stock</span>
          </div>
        )}

        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, i) => (
              <div
                key={i}
                className={`h-1 transition-all duration-300 ${
                  i === currentImg ? 'w-5' : 'w-1.5'
                }`}
                style={{
                  background: i === currentImg ? 'var(--theme-primary)' : 'rgba(255,255,255,0.6)'
                }}
              />
            ))}
          </div>
        )}

        {/* === DISCOUNT BADGE === */}
        {discount > 0 && (
          <div className="discount-badge absolute bottom-3 left-3">
            {discount}% OFF
          </div>
        )}
      </div>

      <div className={`${isGrid ? 'pt-4' : 'flex-1'}`}>
        {product.category && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1"
            style={{ color: 'var(--theme-primary)' }}
          >
            {product.category}
          </p>
        )}
        <h3 className="font-heading leading-tight transition-colors text-sm md:text-base"
          style={{ color: 'var(--theme-text)' }}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <span className="font-bold text-sm md:text-base" style={{ color: 'var(--theme-primary)' }}>
            ₹{product.price}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs line-through" style={{ color: '#6b7280' }}>
              ₹{product.originalPrice}
            </span>
          )}
        </div>
        {product.stock > 0 && product.stock <= 3 && (
          <p className="mt-1.5 text-[10px] font-semibold flex items-center gap-1" style={{ color: '#dc2626' }}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Only {product.stock} left
          </p>
        )}
      </div>
    </Link>
  );
}
