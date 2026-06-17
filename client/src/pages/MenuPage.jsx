import { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { Star, Search, Plus, Eye, Heart } from 'lucide-react';

const VegIndicator = ({ isVeg }) => (
  <span 
    className={`inline-flex items-center justify-center w-4 h-4 border-2 rounded shrink-0 bg-white/5 ${
      isVeg ? 'border-green-600 bg-green-600/5' : 'border-red-600 bg-red-600/5'
    }`}
    title={isVeg ? 'Veg' : 'Non-Veg'}
  >
    {isVeg ? (
      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
    ) : (
      <svg className="w-2 h-2 fill-red-600" viewBox="0 0 100 100">
        <polygon points="50,15 90,85 10,85" />
      </svg>
    )}
  </span>
);

export default function MenuPage({
  onAddToCart,
  onItemClick,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  currentUser,
  onToggleFavourite,
  menuCategories = [],
}) {
  const [vegFilter, setVegFilter] = useState('all');

  const categories = [
    { id: 'all', name: 'All Dishes' },
    ...menuCategories.map((cat) => ({ id: cat.id, name: cat.name })),
  ];
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // Filter items based on activeCategory AND searchQuery AND vegFilter
  let displayedItems = [];
  
  menuCategories.forEach((cat) => {
    // Skip if category filter is active and doesn't match this category
    if (activeCategory !== 'all' && cat.id !== activeCategory) {
      return;
    }
    
    cat.items.forEach((item) => {
      // Apply search query filter if present
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCatName = cat.name.toLowerCase().includes(query);
        const matchesDesc = item.description && item.description.toLowerCase().includes(query);
        
        if (!matchesName && !matchesCatName && !matchesDesc) {
          return;
        }
      }
      
      // Apply Veg/Non-Veg filter
      if (vegFilter === 'veg' && item.isVeg === false) {
        return;
      }
      if (vegFilter === 'non-veg' && item.isVeg !== false) {
        return;
      }
      
      displayedItems.push({ ...item, categoryId: cat.id });
    });
  });

  return (
    <div className="min-h-screen bg-navy text-cream pt-24">
      {/* Menu Header Banner */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark via-navy-light/10 to-navy pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sunset uppercase tracking-[0.3em] text-sm font-semibold mb-3 animate-pulse">
            Royal Bites Cuisine
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gradient mb-4">
            Our Signature Menu
          </h1>
          <p className="text-cream/75 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Delicately curated recipes designed to pamper your taste buds with royal richness. Fully custom-prepared.
          </p>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar - Menu Categories (Sticky on Desktop, Horizontal Scroll on Mobile) */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-28 z-20">
            {/* Desktop Categories Panel */}
            <div className="hidden lg:block glass rounded-3xl p-6 border border-white/10 bg-navy-light/40 backdrop-blur-md">
              <h2 className="font-display text-sm font-bold text-gradient mb-6 pb-3 border-b border-white/5 uppercase tracking-[0.2em]">
                Categories
              </h2>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-bold transition-all border duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-sunset/20 to-gold/15 border-sunset text-gold shadow-[0_0_15px_rgba(242,100,25,0.25)]'
                          : 'bg-white/5 border-white/5 text-cream/70 hover:text-cream hover:bg-white/10 hover:border-sunset/35 hover:shadow-[0_0_12px_rgba(242,100,25,0.15)]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Categories - Horizontal Scroll Chips */}
            <div className="lg:hidden w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4 flex gap-2">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-bold transition-all border duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-sunset/20 to-gold/15 border-sunset text-gold shadow-[0_0_10px_rgba(242,100,25,0.2)]'
                        : 'bg-white/5 border-white/10 text-cream/75 hover:text-cream hover:border-sunset/35'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Section - Filters and Food Grid */}
          <div className="flex-1 w-full">
            {/* Search + Veg/Non-Veg Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch mb-8 w-full">
              {/* Search Box - Largest width */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/40" />
                <input
                  type="text"
                  placeholder="Search for biryani, paneer, dosa, naan, noodles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-12 pr-12 py-3.5 text-base rounded-2xl glass w-full h-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-sunset hover:text-gold transition-colors font-medium cursor-pointer bg-transparent border-0"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Veg / Non-Veg Pill Filter */}
              <div className="flex bg-white/10 border border-white/20 p-1.5 rounded-2xl glass shrink-0 items-center justify-between gap-1 w-full sm:w-auto">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'veg', label: 'Veg', color: 'bg-green-600' },
                  { id: 'non-veg', label: 'Non-Veg', color: 'bg-red-600' }
                ].map((opt) => {
                  const isActive = vegFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setVegFilter(opt.id)}
                      className={`flex-1 sm:flex-initial relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
                        isActive
                          ? 'bg-gradient-to-r from-sunset to-gold-dark text-white shadow-md'
                          : 'text-cream/60 hover:text-cream bg-transparent'
                      }`}
                    >
                      {!isActive && opt.color && (
                        <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                      )}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dishes Grid */}
            <div className="w-full">
              {displayedItems.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {displayedItems.map((item) => (
                    <article
                      key={item.name}
                      className="glass-card group overflow-hidden border border-white/10 hover:border-sunset/45 transition-all duration-500 hover:-translate-y-1.5 flex flex-col h-full"
                    >
                      {/* Thumbnail Header */}
                      <div className="relative h-48 sm:h-52 overflow-hidden shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/95 to-transparent" />
                        
                        {item.available === false && (
                          <div className="absolute inset-0 bg-navy/80 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <span className="px-4 py-2 rounded-xl bg-red-500/25 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        
                        {/* Rating & Favorite Badges */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                          <div>
                            {item.tag && (
                              <span className="inline-block px-3 py-1 rounded-full bg-sunset/90 text-navy text-[10px] font-bold uppercase tracking-wider">
                                {item.tag}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-navy/85 border border-white/10 text-gold text-xs font-semibold">
                              <Star className="w-3.5 h-3.5 fill-gold stroke-gold" />
                              {item.rating || '4.5'}
                            </span>
                            
                            <button
                              type="button; cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavourite && onToggleFavourite(item.name);
                              }}
                              className="p-1.5 rounded-full bg-navy/80 border border-white/10 text-cream/80 hover:text-pink hover:bg-navy transition-all duration-300 cursor-pointer"
                              aria-label="Like item"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 transition-colors ${
                                  currentUser && currentUser.favouriteDishes && currentUser.favouriteDishes.includes(item.name)
                                    ? 'fill-pink text-pink'
                                    : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Details Body */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div className="flex items-start gap-2 pt-0.5 min-w-0 flex-1">
                            <VegIndicator isVeg={item.isVeg !== false} />
                            <h3 className="font-display text-lg sm:text-xl text-cream group-hover:text-gold transition-colors leading-tight">
                              {item.name}
                            </h3>
                          </div>
                          <span className="text-gold font-bold text-lg shrink-0">₹{item.price}</span>
                        </div>
                        <p className="text-cream/60 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                          {item.description}
                        </p>
                        
                        {/* Card Actions Footer */}
                        <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
                          <button
                            type="button"
                            onClick={() => onItemClick && onItemClick(item)}
                            className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/15 border border-white/10 text-cream transition-all duration-300 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-gold" />
                            Quick View
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => onAddToCart && onAddToCart(item)}
                            disabled={item.available === false}
                            className={`flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                              item.available === false
                                ? 'bg-white/5 border border-white/5 text-cream/35 cursor-not-allowed'
                                : 'bg-gradient-to-r from-sunset to-gold-dark text-navy hover:shadow-md hover:shadow-sunset/15 active:scale-95 transition-all duration-300 cursor-pointer'
                            }`}
                          >
                            {item.available !== false && <Plus className="w-3.5 h-3.5" />}
                            {item.available === false ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 glass rounded-3xl max-w-lg mx-auto border border-white/10 p-6">
                  <p className="text-cream/60 mb-4 font-medium">No dishes found for this filter.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                      setVegFilter('all');
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-sunset to-gold text-navy rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer border-0"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* Standalone Footer */}
      <Footer />
    </div>
  );
}
