import { Sparkles, ArrowRight } from 'lucide-react';

const collections = [
  {
    title: 'Royal Thali Specials',
    description: 'A premium dining experience featuring signature curries, breads, and desserts served in royal style.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=450&fit=crop',
    count: '3 Varieties',
    tag: 'Popular',
  },
  {
    title: 'Sunset Dinner Combos',
    description: 'Crafted perfectly for couples. Share a premium starter, main course, and drink under warm lighting.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&h=450&fit=crop',
    count: '4 Combos',
    tag: 'Trending',
  },
  {
    title: 'Family Feast',
    description: 'A massive custom spread for the entire family. Includes starters, main course, breads, and double desserts.',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&h=450&fit=crop',
    count: 'Serves 4-6',
    tag: 'Value Pack',
  },
  {
    title: 'Chef’s Signature Picks',
    description: 'Exceptional culinary creations handpicked and recommended by our master chef.',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=600&h=450&fit=crop',
    count: '5 Dishes',
    tag: 'Must Try',
  },
];

export default function FeaturedCollections() {
  const scrollToMenu = () => {
    document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="collections" className="relative py-20 bg-navy">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/20 to-navy pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <p className="text-sunset uppercase tracking-[0.3em] text-sm font-medium mb-3">
              Curated Experiences
            </p>
            <h2 className="section-title">Featured Collections</h2>
            <p className="text-cream/60 mt-2 max-w-xl">
              Explore our handpicked selections designed to make your dining experience truly memorable.
            </p>
          </div>
          <button
            onClick={scrollToMenu}
            className="mt-4 md:mt-0 flex items-center gap-2 text-gold hover:text-sunset transition-colors font-medium text-sm group"
          >
            Explore all categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((col) => (
            <article
              key={col.title}
              onClick={scrollToMenu}
              className="glass-card group relative overflow-hidden h-[400px] cursor-pointer hover:border-sunset/40 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-end"
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
              </div>

              {/* Tag */}
              <span className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-navy/80 border border-white/10 text-gold text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-gold fill-current" />
                {col.tag}
              </span>

              {/* Card content */}
              <div className="p-6 relative z-10">
                <p className="text-xs text-sunset font-semibold uppercase tracking-wider mb-1">
                  {col.count}
                </p>
                <h3 className="font-display text-xl text-cream mb-2 group-hover:text-gold transition-colors">
                  {col.title}
                </h3>
                <p className="text-cream/60 text-xs leading-relaxed opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-20 transition-all duration-500 overflow-hidden">
                  {col.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
