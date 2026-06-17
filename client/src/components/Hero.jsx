import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Star, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const hotelSlides = [
  {
    id: 1,
    title: "Sanctuary of Pure Grandeur",
    subtitle: "Experience 5-star oceanfront luxury where timeless heritage meets contemporary elegance.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    tag: "Welcome to Royal Grand",
    rating: "5.0",
    link: "/rooms"
  },
  {
    id: 2,
    title: "Lavish Suites & Ocean Villas",
    subtitle: "Indulge in private heated infinity pools and personalized 24/7 butler services.",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80",
    tag: "Accommodations",
    rating: "4.9",
    link: "/rooms"
  },
  {
    id: 3,
    title: "Gourmet Michelin-Style Dining",
    subtitle: "Savor exquisite culinary art prepared by award-winning chefs at Royal Bites.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
    tag: "Royal Bites Restaurant",
    rating: "4.9",
    link: "/menu"
  },
  {
    id: 4,
    title: "Tranquility & Rejuvenation",
    subtitle: "Restore absolute harmony with traditional Ayurvedic rituals and stone therapies.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80",
    tag: "Spa & Wellness Sanctuary",
    rating: "5.0",
    link: "/spa"
  }
];

export default function Hero() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [transitionState, setTransitionState] = useState('idle'); // 'idle' | 'leaving' | 'entering'
  const [isHovered, setIsHovered] = useState(false);

  const currentSlide = hotelSlides[currentIdx];
  const nextIdx = (currentIdx + 1) % hotelSlides.length;
  const nextSlide = hotelSlides[nextIdx];

  const triggerTransition = (targetIdx) => {
    if (transitionState !== 'idle' || targetIdx === currentIdx) return;
    setTransitionState('leaving');
    setTimeout(() => {
      setCurrentIdx(targetIdx);
      setTransitionState('entering');
      setTimeout(() => {
        setTransitionState('idle');
      }, 400);
    }, 400);
  };

  // Preloader for the next slide's image
  useEffect(() => {
    const img = new Image();
    img.src = nextSlide.image;
  }, [nextSlide]);

  // Auto rotation every 4 seconds when not hovered and idle
  useEffect(() => {
    if (isHovered || transitionState !== 'idle') return;
    const interval = setInterval(() => {
      triggerTransition(nextIdx);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIdx, isHovered, transitionState]);

  // 3D Hover Tilt Effect
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const rotateX = -(y / box.height) * 10;
    const rotateY = (x / box.width) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden hero-gradient"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sunset/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-pink/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gold">
              <Sparkles className="w-4 h-4" />
              <span>5-Star Luxury Resort Destination</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-cream">Experience</span>
              <br />
              <span className="text-gradient">Royal Grand</span>
            </h1>

            <p className="text-base sm:text-lg text-cream/70 max-w-lg leading-relaxed min-h-[5rem]">
              {currentSlide.subtitle}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/booking" className="btn-primary py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider">
                Book A Stay
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to={currentSlide.link} className="btn-secondary py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider">
                Explore Details
              </Link>
            </div>

            <div className="flex gap-8 pt-4">
              {[
                { value: '5-Star', label: 'Hotel & Resort' },
                { value: '4.9', label: 'Guest Rating' },
                { value: '24/7', label: 'Butler Service' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-bold text-gold">{stat.value}</p>
                  <p className="text-xs text-cream/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative animate-float">
              <div
                className="relative rounded-3xl overflow-hidden glass-strong p-2 tilt-container transition-all duration-300 hover:shadow-[0_0_40px_rgba(42,103,219,0.3)] shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={() => setIsHovered(true)}
              >
                {/* Images Showcase Area */}
                <div className="relative w-full h-[320px] sm:h-[450px] lg:h-[520px] rounded-2xl overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.triggerShare && window.triggerShare({
                        title: 'Royal Grand Hotel & Resort',
                        text: `${currentSlide.title} — 5-star experience 🏨`,
                        url: window.location.origin
                      });
                    }}
                    className="absolute top-4 left-4 z-40 p-3 rounded-full bg-navy/80 border border-white/10 text-cream/80 hover:text-gold hover:bg-navy transition-all duration-300 shadow-lg cursor-pointer"
                    aria-label="Share slide details"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <img
                    key={currentSlide.id}
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    className={`w-full h-full object-cover ${
                      transitionState === 'leaving' ? 'animate-fade-out-400' :
                      transitionState === 'entering' ? 'animate-fade-in-400' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Glassmorphic Slide Info Overlay */}
                <div className="absolute bottom-8 left-8 right-8 z-30">
                  <div
                    key={currentSlide.id}
                    className={`glass-card p-5 border border-white/10 rounded-2xl relative text-left ${
                      transitionState === 'leaving' ? 'animate-fade-out-400' :
                      transitionState === 'entering' ? 'animate-fade-in-400' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-sunset/20 text-sunset text-[10px] font-bold uppercase tracking-wider mb-2">
                          {currentSlide.tag}
                        </span>
                        <p className="text-gold text-xs font-semibold mb-1 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" /> {currentSlide.rating} Review Rating
                        </p>
                        <p className="font-display text-lg sm:text-2xl font-bold text-cream leading-tight">{currentSlide.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2.5 mt-6 relative z-40">
                {hotelSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => triggerTransition(idx)}
                    className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                      currentIdx === idx
                        ? 'bg-gold w-6 shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                        : 'bg-cream/30 hover:bg-cream/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Hidden image element to force preloading */}
            {nextSlide && (
              <img
                src={nextSlide.image}
                className="hidden"
                aria-hidden="true"
                alt=""
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
