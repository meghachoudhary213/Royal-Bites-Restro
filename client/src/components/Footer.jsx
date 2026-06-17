import { Crown, MapPin, Phone, Mail, Clock, Share2, Heart, Star } from 'lucide-react';
import { restaurantInfo } from '../data/menu';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="contact" className="relative pt-20 pb-8 border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-sunset to-gold">
                <Crown className="w-5 h-5 text-cream" />
              </div>
              <span className="font-display text-2xl font-bold text-gradient">
                Royal Grand
              </span>
            </div>
            <p className="text-cream/60 text-sm leading-relaxed">
              A 5-star sanctuary of timeless elegance where heritage meets contemporary luxury. 
              Experience top-tier accommodation, wellness, and fine dining at our signature restaurant, Royal Bites.
            </p>
          </div>

          <div>
            <h4 className="text-gold font-semibold mb-4 font-display">Resort Links</h4>
            <ul className="space-y-2.5 text-sm text-cream/70">
              <li>
                <Link to="/rooms" className="hover:text-gold transition-colors">Luxury Rooms & Suites</Link>
              </li>
              <li>
                <Link to="/spa" className="hover:text-gold transition-colors">Spa & Wellness Sanctuary</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-gold transition-colors">Banquets & Grand Events</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-gold transition-colors">Royal Bites Restaurant</Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-gold transition-colors">Exclusive Offers</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-gold transition-colors">Photo Gallery</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gold font-semibold mb-4 font-display">Contact Resort</h4>
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
            <h4 className="text-gold font-semibold mb-4 font-display">Hours & Share</h4>
            <ul className="space-y-3 text-sm text-cream/70 mb-5">
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-sunset shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-cream/90">Royal Bites Dining Hours</p>
                  <p className="text-xs text-cream/60 mt-0.5">{restaurantInfo.hours.weekdays}</p>
                  <p className="text-xs text-cream/60">{restaurantInfo.hours.weekend}</p>
                </div>
              </li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => window.triggerShare && window.triggerShare({
                  title: 'Royal Grand Hotel & Resort',
                  text: 'Experience 5-star luxury at Royal Grand Hotel & Resort 🏨',
                  url: 'https://royal-bites-restro.onrender.com'
                })}
                className="p-3 rounded-xl glass hover:bg-white/15 text-cream/70 hover:text-gold transition-colors cursor-pointer"
                aria-label="Share Website"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <a
                href="/rooms"
                className="p-3 rounded-xl glass hover:bg-white/15 text-cream/70 hover:text-gold transition-colors flex items-center justify-center"
                aria-label="Rooms"
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
          <p>&copy; {new Date().getFullYear()} Royal Grand Hotel & Resort. All rights reserved.</p>
          <p>Royal Bites is a registered dining brand of Royal Grand.</p>
        </div>
      </div>
    </footer>
  );
}
