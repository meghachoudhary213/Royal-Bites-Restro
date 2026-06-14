import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { restaurantInfo, menuCategories } from '../data/menu';
import { Link } from 'react-router-dom';

const targetNames = [
  "Paneer Butter Masala",
  "Paneer Tikka",
  "Veg Supreme Pizza",
  "Hara Bhara Kebab",
  "Veg Spring Roll",
  "Chole Bhature",
  "Masala Chai",
  "Gulab Jamun"
];

// Flat list of all dishes
const allDishes = menuCategories.flatMap((cat) => cat.items);

// Featured dishes prioritized based on targetNames list
const featuredDishes = targetNames
  .map((name) => allDishes.find((item) => item.name === name))
  .filter(Boolean);

export default function Hero() {
  const [currentDish, setCurrentDish] = useState(featuredDishes[0]);
  const [activeIndicatorDish, setActiveIndicatorDish] = useState(featuredDishes[0]);
  const [nextDish, setNextDish] = useState(null);
  const [transitionState, setTransitionState] = useState('idle'); // 'idle' | 'leaving' | 'entering'
  const [isHovered, setIsHovered] = useState(false);

  // Initialize a random next dish on mount for preloading
  useEffect(() => {
    const remaining = featuredDishes.filter((dish) => dish.name !== currentDish.name);
    if (remaining.length > 0) {
      setNextDish(remaining[Math.floor(Math.random() * remaining.length)]);
    }
  }, []);

  // Update nextDish to preload when currentDish changes or transition ends
  useEffect(() => {
    if (transitionState === 'idle') {
      const remaining = featuredDishes.filter((dish) => dish.name !== currentDish.name);
      if (remaining.length > 0) {
        setNextDish(remaining[Math.floor(Math.random() * remaining.length)]);
      }
    }
  }, [currentDish, transitionState]);

  // Preloader: creates an Image object to load the next dish image in browser cache
  useEffect(() => {
    if (nextDish) {
      const img = new Image();
      img.src = nextDish.image;
    }
  }, [nextDish]);

  const triggerTransition = (targetDish) => {
    if (transitionState !== 'idle' || targetDish.name === currentDish.name) return;

    // 1. Update carousel indicators instantly
    setActiveIndicatorDish(targetDish);

    // 2. Start fade-out of current dish (400ms duration)
    setTransitionState('leaving');

    // 3. After 400ms fade-out, swap data to the new dish and trigger fade-in
    setTimeout(() => {
      setCurrentDish(targetDish);
      setTransitionState('entering');

      // 4. After 400ms fade-in, transition is complete (800ms total transition)
      setTimeout(() => {
        setTransitionState('idle');
      }, 400);
    }, 400);
  };

  // Auto rotation: change dish every 2.5 seconds when idle and not hovered
  useEffect(() => {
    if (isHovered || transitionState !== 'idle') return;

    const interval = setInterval(() => {
      if (nextDish) {
        triggerTransition(nextDish);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [currentDish, nextDish, isHovered, transitionState]);

  const handleIndicatorClick = (dish) => {
    if (transitionState !== 'idle' || dish.name === currentDish.name) return;
    triggerTransition(dish);
  };

  // 3D Hover Tilt Effect
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const rotateX = -(y / box.height) * 15; // Max 15 degrees tilt
    const rotateY = (x / box.width) * 15;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  const getDishTag = (dish) => {
    return dish.tag || (dish.popular ? 'Bestseller' : 'Chef Special');
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden hero-gradient"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sunset/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-gold/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gold">
              <Sparkles className="w-4 h-4" />
              <span>Award-Winning Fine Dining Experience</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-cream">Experience</span>
              <br />
              <span className="text-gradient">Royal Bites</span>
            </h1>

            <p className="text-lg md:text-xl text-cream/70 max-w-lg leading-relaxed">
              {restaurantInfo.tagline}. Indulge in exquisite cuisine crafted with passion,
              served in an atmosphere of timeless elegance beneath the golden sunset.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/booking" className="btn-primary">
                Reserve a Table
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/menu" className="btn-secondary">
                Explore Menu
              </Link>
            </div>

            <div className="flex gap-8 pt-4">
              {[
                { value: '15+', label: 'Years Excellence' },
                { value: '50+', label: 'Signature Dishes' },
                { value: '4.9', label: 'Guest Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl md:text-3xl font-bold text-gold">{stat.value}</p>
                  <p className="text-sm text-cream/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative animate-float">
              <div
                className="relative rounded-3xl overflow-hidden glass-strong p-2 tilt-container transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,107,53,0.35)] shadow-[0_0_20px_rgba(255,209,102,0.15)] cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={() => setIsHovered(true)}
              >
                {/* Images Showcase Area */}
                <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[580px] rounded-2xl overflow-hidden">
                  <img
                    key={currentDish.name}
                    src={currentDish.image}
                    alt={currentDish.name}
                    className={`w-full h-full object-cover animate-ken-burns ${
                      transitionState === 'leaving' ? 'animate-fade-out-400' :
                      transitionState === 'entering' ? 'animate-fade-in-400' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Glassmorphic Dish Info Overlay */}
                <div className="absolute bottom-8 left-8 right-8 z-30">
                  <div
                    key={currentDish.name}
                    className={`glass-card p-5 border border-white/10 rounded-2xl relative ${
                      transitionState === 'leaving' ? 'animate-fade-out-400' :
                      transitionState === 'entering' ? 'animate-fade-in-400' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-sunset/20 text-sunset text-[10px] font-bold uppercase tracking-wider mb-2">
                          {getDishTag(currentDish)}
                        </span>
                        <p className="text-gold text-xs font-semibold mb-1 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" /> {currentDish.rating} Rating
                        </p>
                        <p className="font-display text-xl sm:text-2xl font-bold text-cream">{currentDish.name}</p>
                        <p className="text-cream/60 text-xs mt-1 leading-relaxed">
                          {currentDish.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-cream/40 block leading-none mb-1 uppercase tracking-wider">Price</span>
                        <span className="font-display text-2xl font-bold text-gradient">₹{currentDish.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel Indicators / Controls */}
              <div className="flex justify-center gap-2.5 mt-6 relative z-40">
                {featuredDishes.map((dish, idx) => (
                  <button
                    key={dish.name}
                    onClick={() => handleIndicatorClick(dish)}
                    className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                      activeIndicatorDish.name === dish.name
                        ? 'bg-gold w-6 shadow-[0_0_8px_rgba(255,209,102,0.8)]'
                        : 'bg-cream/30 hover:bg-cream/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Hidden image element to force browser-level preloading for nextDish */}
            {nextDish && (
              <img
                src={nextDish.image}
                className="hidden"
                aria-hidden="true"
                alt=""
              />
            )}

            {/* Floating Brand Badge */}
            <div className="absolute -top-4 -right-4 w-24 h-24 glass rounded-2xl flex items-center justify-center pointer-events-none">
              <span className="font-display text-2xl text-gradient font-bold">RB</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-cream/30 flex justify-center pt-2">
          <div className="w-1 h-2 bg-gold rounded-full" />
        </div>
      </div>
    </section>
  );
}
