// src/pages/Shop.tsx
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import { useProductsStore } from '../store/productsStore';

const sortOptions = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name', label: 'Name A–Z' },
];

export default function Shop() {
  const { products, varieties, isLoading } = useProductsStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedVariety, setSelectedVariety] = useState(searchParams.get('variety') || 'All');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.variety.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Filter by variety
    if (selectedVariety !== 'All') {
      list = list.filter((p) => p.variety === selectedVariety);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.prices[0].price - b.prices[0].price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.prices[0].price - a.prices[0].price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  }, [searchQuery, selectedVariety, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { search: searchQuery } : {});
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedVariety('All');
    setSortBy('default');
    setSearchParams({});
  };

  const isFiltered = searchQuery || selectedVariety !== 'All' || sortBy !== 'default';

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="section-subtitle">Our Collection</p>
          <h1 className="section-title">Shop Rice</h1>
          <div className="gold-divider mt-4" />
        </div>

        {/* Variety tabs */}
        <div className="flex gap-3 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {['All', ...varieties].map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVariety(v)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                selectedVariety === v
                  ? 'bg-[#d4a017] text-[#0f1a0f] border-[#d4a017]'
                  : 'border-[#2d4a2d] text-gray-300 hover:border-[#d4a017] hover:text-[#d4a017]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <button type="submit" className="btn-primary px-5">
              Search
            </button>
          </form>

          <div className="flex gap-3 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input py-3 pr-8 cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#1a2e1a]">
                  {o.label}
                </option>
              ))}
            </select>
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-[#d4a017] border border-[#d4a017]/30 px-3 py-3 rounded-lg hover:bg-[#d4a017]/10 transition-colors whitespace-nowrap"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-gray-400 text-sm mb-6">
          Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          {selectedVariety !== 'All' && ` in ${selectedVariety}`}
          {searchQuery && ` for "${searchQuery}"`}
        </p>

        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="font-serif text-2xl text-white mb-2">No products found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
