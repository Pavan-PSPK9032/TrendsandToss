import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'name-desc', label: 'Name: Z-A' },
];

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="skeleton aspect-[3/4] mb-4" />
      <div className="skeleton h-3 w-1/3 mb-2" />
      <div className="skeleton h-4 w-2/3 mb-2" />
      <div className="skeleton h-3 w-1/4" />
    </div>
  );
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) {
      setSelectedCategories([catFromUrl]);
    }
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?limit=200'),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (catName) => {
    setSelectedCategories(prev =>
      prev.includes(catName)
        ? prev.filter(c => c !== catName)
        : [...prev, catName]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 100000 });
    setSortBy('newest');
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.tags?.some?.(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    result = result.filter(p =>
      p.price >= priceRange.min && p.price <= priceRange.max
    );

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name-asc': result.sort((a, b) => a.name?.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name?.localeCompare(a.name)); break;
      default: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }

    return result;
  }, [products, searchQuery, selectedCategories, priceRange, sortBy]);

  const visibleProducts = filteredProducts;

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 ||
    priceRange.min > 0 || priceRange.max < 100000 || sortBy !== 'newest';

  const getCategoryCount = (catName) => {
    return products.filter(p => p.category === catName).length;
  };

  const filterSidebar = (
    <div className="space-y-8 pr-2">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--theme-text)' }}>Categories</h3>
        <div className="space-y-4">
          {['women', 'men'].map(gender => {
            const filtered = categories.filter(c => c.gender === gender || (!c.gender && gender === 'women'))
            if (filtered.length === 0) return null
            return (
              <div key={gender}>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1.5 px-3" style={{ color: 'var(--theme-text)', opacity: 0.3 }}>{gender}&#39;s</p>
                <div className="space-y-0.5">
                  {filtered.map(cat => {
                    const isActive = selectedCategories.includes(cat.name);
                    const count = getCategoryCount(cat.name);
                    return (
                      <button
                        key={cat._id}
                        onClick={() => toggleCategory(cat.name)}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm transition-all duration-200 group border-l-2 ${
                          isActive ? 'font-medium' : 'border-transparent'
                        }`}
                        style={{
                          color: isActive ? 'var(--theme-primary)' : 'var(--theme-text)',
                          opacity: isActive ? 1 : 0.6,
                          borderLeftColor: isActive ? 'var(--theme-primary)' : 'transparent',
                          background: isActive ? 'var(--bg-secondary)' : 'transparent'
                        }}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className={`text-[11px] font-medium ml-2 shrink-0 ${isActive ? '' : ''}`}
                          style={{ color: isActive ? 'var(--theme-primary)' : 'var(--theme-text)', opacity: isActive ? 1 : 0.2 }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          })}
          {categories.filter(c => c.gender === 'unisex').length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1.5 px-3" style={{ color: 'var(--theme-text)', opacity: 0.3 }}>Unisex</p>
              <div className="space-y-0.5">
                {categories.filter(c => c.gender === 'unisex').map(cat => {
                  const isActive = selectedCategories.includes(cat.name);
                  const count = getCategoryCount(cat.name);
                  return (
                    <button
                      key={cat._id}
                      onClick={() => toggleCategory(cat.name)}
                      className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm transition-all duration-200 group border-l-2 ${
                        isActive ? 'font-medium' : 'border-transparent'
                      }`}
                      style={{
                        color: isActive ? 'var(--theme-primary)' : 'var(--theme-text)',
                        opacity: isActive ? 1 : 0.6,
                        borderLeftColor: isActive ? 'var(--theme-primary)' : 'transparent',
                        background: isActive ? 'var(--bg-secondary)' : 'transparent'
                      }}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className={`text-[11px] font-medium ml-2 shrink-0`}
                        style={{ color: isActive ? 'var(--theme-primary)' : 'var(--theme-text)', opacity: isActive ? 1 : 0.2 }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {categories.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--theme-text)', opacity: 0.3 }}>No categories</p>
          )}
        </div>
      </div>

      <div className="border-t pt-8" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--theme-text)' }}>Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>Min</label>
              <input type="number" value={priceRange.min}
                onChange={e => setPriceRange(p => ({ ...p, min: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm focus:outline-none"
                style={{ border: '1px solid var(--border)', color: 'var(--theme-text)', background: 'var(--input-bg)' }}
                placeholder="0" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>Max</label>
              <input type="number" value={priceRange.max === 100000 ? '' : priceRange.max}
                onChange={e => setPriceRange(p => ({ ...p, max: e.target.value ? Number(e.target.value) : 100000 }))}
                className="w-full px-3 py-2 text-sm focus:outline-none"
                style={{ border: '1px solid var(--border)', color: 'var(--theme-text)', background: 'var(--input-bg)' }}
                placeholder="Max" />
            </div>
          </div>
          <input type="range" min={0} max={50000} step={500}
            value={Math.min(priceRange.max, 50000)}
            onChange={e => setPriceRange(p => ({ ...p, max: Number(e.target.value) }))}
            className="w-full" style={{ accentColor: 'var(--theme-primary)' }} />
          <div className="flex justify-between text-[11px]" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
            <span>₹0</span>
            <span>₹50,000+</span>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters}
          className="w-full py-3 text-xs font-semibold uppercase tracking-widest transition-all duration-300"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--theme-text)',
            background: 'transparent'
          }}
          onMouseEnter={e => { e.target.style.background = 'var(--theme-text)'; e.target.style.color = '#fff' }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--theme-text)' }}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div style={{ background: 'var(--bg)' }}>
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl tracking-tight mb-3"
              style={{ color: 'var(--theme-text)' }}
            >
              All Products
            </h1>
            <p className="text-sm tracking-wide" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
              {loading ? 'Loading...' : `${filteredProducts.length} piece${filteredProducts.length !== 1 ? 's' : ''} available`}
            </p>
          </div>

          <div className="max-w-xl mx-auto mt-8">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--theme-text)', opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, category, tags..."
                className="w-full py-3.5 pl-12 pr-4 text-sm focus:outline-none transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  color: 'var(--theme-text)',
                  background: 'var(--input-bg)'
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--theme-text)', opacity: 0.3 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowFilters(p => !p)}
              className="md:hidden px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all border"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--theme-text)',
                background: 'transparent'
              }}
            >
              <span className="flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
              </span>
            </button>
            <p className="text-sm hidden md:block" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
              Showing <span className="font-medium" style={{ color: 'var(--theme-text)' }}>{visibleProducts.length}</span> of <span className="font-medium" style={{ color: 'var(--theme-text)' }}>{filteredProducts.length}</span> pieces
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[11px] uppercase tracking-widest hidden sm:block" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>Sort by</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 text-sm focus:outline-none cursor-pointer"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--theme-text)',
                background: 'var(--card-bg)'
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:hidden -mx-4 px-4 pb-4 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 min-w-max items-center">
            <button onClick={() => setSelectedCategories([])}
              className="whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border"
              style={{
                background: selectedCategories.length === 0 ? 'var(--theme-text)' : 'transparent',
                color: selectedCategories.length === 0 ? '#fff' : 'var(--theme-text)',
                borderColor: selectedCategories.length === 0 ? 'transparent' : 'var(--border)'
              }}
            >
              All
            </button>
            <span className="w-px h-5 mx-1 shrink-0" style={{ background: 'var(--border)' }} />
            {['women', 'men', 'unisex'].map(gender => {
              const filtered = categories.filter(c => c.gender === gender || (!c.gender && gender === 'women'))
              if (filtered.length === 0) return null
              return (
                <div key={gender} className="flex gap-2 items-center">
                  <span className="text-[10px] uppercase tracking-wider font-semibold shrink-0" style={{ color: 'var(--theme-text)', opacity: 0.3 }}>{gender}&#39;s</span>
                  {filtered.map(cat => (
                    <button key={cat._id} onClick={() => toggleCategory(cat.name)}
                      className="whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border"
                      style={{
                        background: selectedCategories.includes(cat.name) ? 'var(--theme-text)' : 'transparent',
                        color: selectedCategories.includes(cat.name) ? '#fff' : 'var(--theme-text)',
                        borderColor: selectedCategories.includes(cat.name) ? 'transparent' : 'var(--border)'
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                  <span className="w-px h-5 mx-1 shrink-0" style={{ background: 'var(--border)' }} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-8 lg:gap-12">
          <aside className="hidden md:block w-56 lg:w-64 flex-shrink-0">
            <div className="sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
              {filterSidebar}
            </div>
          </aside>

          <aside className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowFilters(false)} />
            <div className={`absolute top-0 left-0 bottom-0 w-72 p-6 overflow-y-auto transition-transform duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}
              style={{ background: 'var(--card-bg)' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--theme-text)' }}>Filters</h2>
                <button onClick={() => setShowFilters(false)} style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {filterSidebar}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto mb-6" style={{ color: 'var(--theme-text)', opacity: 0.1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-heading mb-2" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>No pieces found</p>
                <button onClick={clearFilters}
                  className="text-sm font-semibold uppercase tracking-widest transition-colors"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {visibleProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
