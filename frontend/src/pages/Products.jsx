import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="bg-navy/5 aspect-[3/4] mb-4" />
      <div className="h-3 bg-navy/5 w-1/3 mb-2" />
      <div className="h-4 bg-navy/5 w-2/3 mb-2" />
      <div className="h-3 bg-navy/5 w-1/4" />
    </div>
  );
}

export default function Products() {
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
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
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
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }

    return result;
  }, [products, searchQuery, selectedCategories, priceRange, sortBy]);

  const visibleProducts = filteredProducts;

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 ||
    priceRange.min > 0 || priceRange.max < 100000 || sortBy !== 'newest';

  const filterSidebar = (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-navy mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => toggleCategory(cat.name)}
              className={`w-full text-left px-3 py-2 text-sm transition-all duration-200 ${
                selectedCategories.includes(cat.name)
                  ? 'bg-navy text-white font-medium'
                  : 'text-navy/60 hover:bg-navy/5 hover:text-navy'
              }`}
            >
              {cat.name}
            </button>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-navy/30">No categories</p>
          )}
        </div>
      </div>

      <div className="border-t border-navy/10 pt-8">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-navy mb-4">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-widest text-navy/40 mb-1">Min</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={e => setPriceRange(p => ({ ...p, min: Number(e.target.value) }))}
                className="w-full border border-navy/20 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none"
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-widest text-navy/40 mb-1">Max</label>
              <input
                type="number"
                value={priceRange.max === 100000 ? '' : priceRange.max}
                onChange={e => setPriceRange(p => ({ ...p, max: e.target.value ? Number(e.target.value) : 100000 }))}
                className="w-full border border-navy/20 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none"
                placeholder="Max"
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={Math.min(priceRange.max, 50000)}
            onChange={e => setPriceRange(p => ({ ...p, max: Number(e.target.value) }))}
            className="w-full accent-gold"
          />
          <div className="flex justify-between text-[11px] text-navy/40">
            <span>Rs.0</span>
            <span>Rs.50,000+</span>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full border border-navy/20 py-3 text-xs font-semibold uppercase tracking-widest text-navy hover:bg-navy hover:text-white transition-all duration-300"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white">
      <div className="border-b border-navy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-navy tracking-tight mb-3">
              All Products
            </h1>
            <p className="text-navy/40 text-sm tracking-wide">
              {loading ? 'Loading...' : `${filteredProducts.length} piece${filteredProducts.length !== 1 ? 's' : ''} available`}
            </p>
          </div>

          <div className="max-w-xl mx-auto mt-8">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search jewellery..."
                className="w-full border border-navy/20 py-3.5 pl-12 pr-4 text-sm text-navy placeholder-navy/30 focus:border-gold focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/30 hover:text-navy/60 transition-colors"
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
            <button
              onClick={() => setShowFilters(p => !p)}
              className="md:hidden border border-navy/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-navy hover:bg-navy hover:text-white transition-all"
            >
              <span className="flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
              </span>
            </button>
            <p className="text-sm text-navy/40 hidden md:block">
              Showing <span className="text-navy font-medium">{visibleProducts.length}</span> of <span className="text-navy font-medium">{filteredProducts.length}</span> pieces
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[11px] uppercase tracking-widest text-navy/40 hidden sm:block">Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-navy/20 px-4 py-2 text-sm text-navy bg-white focus:border-gold focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8 lg:gap-12">
          <aside className="hidden md:block w-56 lg:w-64 flex-shrink-0">
            <div className="sticky top-28">
              {filterSidebar}
            </div>
          </aside>

          <aside className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowFilters(false)} />
            <div className={`absolute top-0 left-0 bottom-0 w-72 bg-white p-6 overflow-y-auto transition-transform duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-navy">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="text-navy/40 hover:text-navy">
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
                <svg className="w-16 h-16 mx-auto text-navy/10 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-playfair text-navy/40 mb-2">No pieces found</p>
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold uppercase tracking-widest text-gold hover:text-gold-dark transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {visibleProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
