import { useState } from 'react';
import { menuCategories } from '../data/menu';
import { Star, Search, Plus, ShoppingBag } from 'lucide-react';

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

export default function Menu({ 
  onItemClick, 
  onAddToCart,
  activeCategory: externalActiveCategory,
  setActiveCategory: externalSetActiveCategory,
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery
}) {
  const [localActiveCategory, localSetActiveCategory] = useState(menuCategories[0].id);
  const [localSearchQuery, localSetSearchQuery] = useState('');

  // Determine whether to use external or local state
  const activeCategory = externalActiveCategory !== undefined ? externalActiveCategory : localActiveCategory;
  const setActiveCategory = externalSetActiveCategory !== undefined ? externalSetActiveCategory : localSetActiveCategory;
  
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : localSearchQuery;
  const setSearchQuery = externalSetSearchQuery !== undefined ? externalSetSearchQuery : localSetSearchQuery;

  // Find active category
  const currentCategory = menuCategories.find((c) => c.id === activeCategory);

  // Filter items based on active category or search query
  let displayedItems = [];
  if (searchQuery.trim() === '') {
    displayedItems = currentCategory ? currentCategory.items : [];
  } else {
    // Search across all categories
    const query = searchQuery.toLowerCase();
    menuCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (
          item.name.toLowerCase().includes(query) ||
          cat.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
        ) {
          // Avoid duplicates if item name is identical (shouldn't be, but safe check)
          if (!displayedItems.some((existing) => existing.name === item.name)) {
            displayedItems.push({ ...item, categoryId: cat.id });
          }
        }
      });
    });
  }

  return (
    <section id="menu" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/50 to-navy pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sunset uppercase tracking-[0.3em] text-sm font-medium mb-4">
            Culinary Excellence
          </p>
          <h2 className="section-title mb-4">Explore Our Menu</h2>
          <p className="text-cream/60 max-w-2xl mx-auto">
            Each dish is a masterpiece, crafted with the finest ingredients and presented
            with royal elegance.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-cream/40" />
            <input
              type="text"
              placeholder="Search for biryani, paneer, dosa, naan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12 pr-4 py-3 text-base"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3 text-sm text-sunset hover:text-gold transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Selector with Horizontal Scroll */}
        {searchQuery.trim() === '' && (
          <div className="mb-12">
            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar justify-start md:justify-center">
              {menuCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-sunset to-gold text-navy shadow-lg shadow-sunset/30'
                      : 'glass text-cream/80 hover:bg-white/15'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items Grid */}
        {displayedItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {displayedItems.map((item) => (
              <article
                key={item.name}
                onClick={() => onItemClick && onItemClick(item)}
                className="glass-card group overflow-hidden hover:border-sunset/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 to-transparent" />
                  
                  {/* Rating Badge */}
                  <span className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-navy/85 border border-white/10 text-gold text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-gold stroke-gold" />
                    {item.rating || '4.5'}
                  </span>

                  {item.tag && (
                    <span className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-sunset/90 text-navy text-xs font-semibold">
                      {item.tag}
                    </span>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex items-start gap-2 pt-0.5 min-w-0 flex-1">
                      <VegIndicator isVeg={item.isVeg !== false} />
                      <h3 className="font-display text-xl text-cream group-hover:text-gold transition-colors leading-tight">
                        {item.name}
                      </h3>
                    </div>
                    <span className="text-gold font-bold text-lg shrink-0">₹{item.price}</span>
                  </div>
                  <p className="text-cream/60 text-sm leading-relaxed mb-4 line-clamp-2">{item.description}</p>
                  
                  {/* Action Buttons inside Card */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs text-sunset-dark font-medium group-hover:text-sunset transition-colors">
                      Tap to view details
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent opening modal
                        onAddToCart && onAddToCart(item);
                      }}
                      className="p-2 rounded-xl bg-white/10 hover:bg-sunset text-cream hover:text-navy transition-all duration-300"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-3xl max-w-lg mx-auto">
            <p className="text-cream/60 mb-2">No dishes matched your search.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sunset font-medium hover:underline"
            >
              Show all categories
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
