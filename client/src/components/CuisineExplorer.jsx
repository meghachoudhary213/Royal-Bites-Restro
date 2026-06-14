const cuisines = [
  {
    id: 'north-indian',
    name: 'North Indian',
    image: '/menu/paneer-butter-masala.jpg',
    tagline: 'Rich gravies, paneer & butter naans',
  },
  {
    id: 'south-indian',
    name: 'South Indian',
    image: '/menu/masala-dosa.jpg',
    tagline: 'Crispy dosas & steamed idlis',
  },
  {
    id: 'biryani',
    name: 'Biryani',
    image: '/menu/chicken-biryani.jpg',
    tagline: 'Aromatic basmati layered delicacies',
  },
  {
    id: 'chinese',
    name: 'Chinese',
    image: '/menu/hakka-noodles.jpg',
    tagline: 'Wok tossed noodles & spring rolls',
  },
  {
    id: 'pizza',
    name: 'Pizza',
    image: '/menu/capsicum-pizza.jpg',
    tagline: 'Classic margheritas & supreme pizzas',
  },
  {
    id: 'burgers',
    name: 'Burgers',
    image: '/menu/crispy-veg-burger.jpg',
    tagline: 'Crispy patties & double cheese burgers',
  },
  {
    id: 'street-food',
    name: 'Street Food',
    image: '/menu/special-pav-bhaji.jpg',
    tagline: 'Spicy pav bhaji & tangy pani puris',
  },
  {
    id: 'desserts',
    name: 'Desserts',
    image: '/menu/gulab-jamun.jpg',
    tagline: 'Royal rasmalais & gulab jamuns',
  },
  {
    id: 'drinks',
    name: 'Drinks',
    image: '/menu/mango-lassi.jpg',
    tagline: 'Cooling lassis & hot masala chai',
  },
];

export default function CuisineExplorer({ onSelectCategory }) {
  return (
    <section id="cuisines" className="relative py-20 bg-navy-dark">
      <div className="absolute inset-0 bg-gradient-to-b from-navy to-navy-dark pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sunset uppercase tracking-[0.3em] text-sm font-medium mb-3">
            Gourmet Cuisines
          </p>
          <h2 className="section-title">Cuisine Explorer</h2>
          <p className="text-cream/60 mt-2 max-w-xl mx-auto">
            Browse dishes by your favorite culinary styles. Click a card to filter our menu instantly.
          </p>
        </div>

        {/* Zomato-inspired Horizontal Category Snap Strip */}
        <div className="flex overflow-x-auto gap-5 pb-6 no-scrollbar snap-x snap-mandatory justify-start xl:justify-center">
          {cuisines.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCategory && onSelectCategory(c.id)}
              className="snap-start shrink-0 w-36 sm:w-40 glass-card group overflow-hidden cursor-pointer hover:border-sunset/45 transition-all duration-500 hover:-translate-y-1.5 flex flex-col text-center"
            >
              <div className="relative h-24 sm:h-26 w-full overflow-hidden shrink-0">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-navy/20" />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-center bg-navy-light/10">
                <h3 className="font-display text-xs sm:text-sm font-bold text-cream group-hover:text-gold transition-colors leading-tight mb-1">
                  {c.name}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-cream/45 leading-snug line-clamp-2">
                  {c.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
