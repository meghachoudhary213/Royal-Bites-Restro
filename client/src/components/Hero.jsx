import { ArrowRight, Sparkles } from 'lucide-react';
import { restaurantInfo } from '../data/menu';
import { Link } from 'react-router-dom';

export default function Hero() {
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
            <div className="relative rounded-3xl overflow-hidden glass-strong p-2 animate-float">
              <img
                src="/menu/paneer-butter-masala.jpg"
                alt="Tonight's Special - Paneer Butter Masala at Royal Bites"
                className="w-full h-[400px] sm:h-[500px] lg:h-[580px] object-cover rounded-2xl"
              />
              <div className="absolute inset-2 rounded-2xl bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 glass-card p-5 border border-white/10 rounded-2xl">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-sunset/20 text-sunset text-[10px] font-bold uppercase tracking-wider mb-2">
                      Limited Availability
                    </span>
                    <p className="text-gold text-xs font-semibold mb-1">⭐ Tonight&apos;s Special</p>
                    <p className="font-display text-xl sm:text-2xl font-bold text-cream">Paneer Butter Masala</p>
                    <p className="text-cream/60 text-xs mt-1 leading-relaxed">
                      Rich & creamy cottage cheese curry served with butter naan.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-cream/40 block leading-none mb-1 uppercase tracking-wider">Price</span>
                    <span className="font-display text-2xl font-bold text-gradient">₹299</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 w-24 h-24 glass rounded-2xl flex items-center justify-center">
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
