import { useState, useEffect } from 'react';
import { galleryImages } from '../data/hotel';
import Footer from '../components/Footer';

const CATEGORIES = ["All", "Resort", "Rooms", "Amenities", "Spa", "Dining", "Events"];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredImages = galleryImages.filter(img => {
    if (activeCategory === "All") return true;
    return img.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-navy text-cream pt-28">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sunset/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sunset uppercase tracking-[0.25em] text-xs font-semibold mb-3">Visual Journey</p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-gradient mb-6">Resort Gallery</h1>
          <p className="text-cream/70 text-sm sm:text-base leading-relaxed">
            Take a look inside our 5-star oceanfront paradise. Explore the lavish details of our suites, the peaceful sanctuary of our spa, banquets, and our signature culinary retreats.
          </p>
        </div>

        {/* Categories Selector */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all border cursor-pointer ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-sunset to-gold-dark text-cream border-transparent shadow-lg"
                  : "glass text-cream/70 border-white/10 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((img, index) => (
            <div 
              key={index} 
              className="glass rounded-3xl overflow-hidden border border-white/10 relative group aspect-square hover:border-white/20 transition-all duration-300 shadow-lg"
            >
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-left pointer-events-none">
                <span className="text-[10px] text-sunset uppercase tracking-widest font-mono mb-1">{img.category}</span>
                <h4 className="font-display text-base font-bold text-cream leading-tight">{img.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
