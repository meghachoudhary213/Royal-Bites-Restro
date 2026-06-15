import { Crown, MapPin, Phone, Mail, Clock, Share2, Heart, Star } from 'lucide-react';
import { restaurantInfo } from '../data/menu';

export default function Footer() {
  return (
    <footer id="contact" className="relative pt-20 pb-8 border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-sunset to-gold">
                <Crown className="w-5 h-5 text-navy" />
              </div>
              <span className="font-display text-2xl font-bold text-gradient">
                Royal Bites
              </span>
            </div>
            <p className="text-cream/60 text-sm leading-relaxed">
              An exquisite culinary destination where luxury meets warmth, and every meal
              becomes a cherished memory.
            </p>
          </div>

          <div>
            <h4 className="text-gold font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-cream/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sunset shrink-0 mt-0.5" />
                {restaurantInfo.address}
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-sunset shrink-0" />
                {restaurantInfo.phone}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-sunset shrink-0" />
                {restaurantInfo.email}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gold font-semibold mb-4">Hours</h4>
            <ul className="space-y-3 text-sm text-cream/70">
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-sunset shrink-0 mt-0.5" />
                <div>
                  <p>{restaurantInfo.hours.weekdays}</p>
                  <p className="mt-1">{restaurantInfo.hours.weekend}</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gold font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <button
                onClick={() => window.triggerShare && window.triggerShare({
                  title: 'Royal Bites',
                  text: 'Experience premium dining at Royal Bites 🍽️',
                  url: 'https://royal-bites-restro.onrender.com'
                })}
                className="p-3 rounded-xl glass hover:bg-white/15 text-cream/70 hover:text-gold transition-colors cursor-pointer"
                aria-label="Share Website"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <a
                href="#popular"
                className="p-3 rounded-xl glass hover:bg-white/15 text-cream/70 hover:text-gold transition-colors flex items-center justify-center"
                aria-label="Favorites"
              >
                <Heart className="w-5 h-5" />
              </a>
              <a
                href="#reviews"
                className="p-3 rounded-xl glass hover:bg-white/15 text-cream/70 hover:text-gold transition-colors flex items-center justify-center"
                aria-label="Reviews"
              >
                <Star className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-cream/40">
          <p>&copy; {new Date().getFullYear()} Royal Bites. All rights reserved.</p>
          <p>Crafted with elegance for discerning palates.</p>
        </div>
      </div>
    </footer>
  );
}
