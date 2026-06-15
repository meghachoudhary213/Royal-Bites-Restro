import { Star, Plus, ArrowRight, Heart, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

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

export default function PopularNearYou({ onItemClick, onAddToCart, currentUser, onToggleFavourite, menuCategories }) {
  // Extract all popular items
  const popularItems = [];
  menuCategories.forEach((category) => {
    category.items.forEach((item) => {
      if (item.popular) {
        popularItems.push({ ...item, categoryId: category.id });
      }
    });
  });

  return (
    <section id="popular" className="relative py-20 bg-navy-dark">
      <div className="absolute inset-0 bg-gradient-to-b from-navy to-navy-dark pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <p className="text-sunset uppercase tracking-[0.3em] text-sm font-medium mb-3">
              Customer Favorites
            </p>
            <h2 className="section-title">Popular at Royal Bites</h2>
            <p className="text-cream/60 mt-2 max-w-xl">
              Our most ordered, highly-rated signature delicacies. Handcrafted to royal perfection.
            </p>
          </div>
          <Link
            to="/menu"
            className="mt-4 md:mt-0 flex items-center gap-2 text-gold hover:text-sunset transition-colors font-medium text-sm group"
          >
            See full menu
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularItems.slice(0, 6).map((item) => (
            <article
              key={item.name}
              onClick={() => onItemClick && onItemClick(item)}
              className="glass-card group overflow-hidden hover:border-sunset/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col h-full"
            >
              <div className="relative h-56 overflow-hidden shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 to-transparent" />

                {item.available === false && (
                  <div className="absolute inset-0 bg-navy/80 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="px-4 py-2 rounded-xl bg-red-500/25 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* Rating & Favorite Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-navy/80 border border-white/10 text-gold text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-gold stroke-gold" />
                    {item.rating}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.triggerShare && window.triggerShare({
                          title: 'Royal Bites',
                          text: `Check out ${item.name} at Royal Bites 🍽️`,
                          url: 'https://royal-bites-restro.onrender.com/menu'
                        });
                      }}
                      className="p-2 rounded-full bg-navy/80 border border-white/10 text-cream/80 hover:text-gold hover:bg-navy transition-all duration-300 cursor-pointer"
                      aria-label="Share item"
                      title={`Share ${item.name}`}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavourite && onToggleFavourite(item.name);
                      }}
                      className="p-2 rounded-full bg-navy/80 border border-white/10 text-cream/80 hover:text-pink hover:bg-navy transition-all duration-300 cursor-pointer"
                      aria-label="Like item"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          currentUser && currentUser.favouriteDishes && currentUser.favouriteDishes.includes(item.name)
                            ? 'fill-pink text-pink'
                            : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {item.tag && (
                  <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-sunset/90 text-navy text-xs font-semibold">
                    {item.tag}
                  </span>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="flex items-start gap-2 pt-0.5 min-w-0 flex-1">
                    <VegIndicator isVeg={item.isVeg !== false} />
                    <h3 className="font-display text-xl text-cream group-hover:text-gold transition-colors leading-tight">
                      {item.name}
                    </h3>
                  </div>
                  <span className="text-gold font-bold text-lg shrink-0">₹{item.price}</span>
                </div>
                
                <p className="text-cream/60 text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <span className="text-xs text-cream/40">
                    {item.available === false ? 'Temporarily unavailable' : 'Delivery in 30-40 mins'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart && onAddToCart(item);
                    }}
                    disabled={item.available === false}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                      item.available === false
                        ? 'bg-white/5 border border-white/5 text-cream/35 cursor-not-allowed'
                        : 'bg-gradient-to-r from-sunset to-gold-dark text-navy hover:shadow-lg hover:shadow-sunset/20 hover:scale-105 active:scale-95 transition-all duration-300'
                    }`}
                  >
                    {item.available !== false && <Plus className="w-3.5 h-3.5" />}
                    {item.available === false ? 'Out of Stock' : 'Order Now'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
