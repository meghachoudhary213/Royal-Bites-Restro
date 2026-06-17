import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import ReviewsSection from '../components/ReviewsSection';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import WhatsAppButton, { openWhatsApp } from '../components/WhatsAppButton';
import { Bed, Users } from 'lucide-react';
import { roomsData, hotelOffers, galleryImages } from '../data/hotel';
import { showSuccess } from '../utils/toast';

export default function Home() {
  const navigate = useNavigate();
  const [whatsappNumber] = useState(import.meta.env.VITE_WHATSAPP_NUMBER || '14155238886');
  const location = useLocation();

  // Quick booking state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('all');

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&roomType=${roomType}`);
  };

  return (
    <>
      <Hero />

      {/* Quick Booking Search Bar Panel */}
      <section className="relative z-20 -mt-16 max-w-5xl mx-auto px-4">
        <form 
          onSubmit={handleSearchSubmit} 
          className="glass rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4 text-left bg-navy/80 backdrop-blur-2xl"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
            <div>
              <label className="block text-[10px] text-cream/60 mb-2 font-semibold uppercase tracking-wider">Check-In</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-cream/60 mb-2 font-semibold uppercase tracking-wider">Check-Out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="input-field py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-cream/60 mb-2 font-semibold uppercase tracking-wider">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="input-field py-2 text-xs text-cream"
              >
                {[1, 2, 3, 4, 6].map(n => (
                  <option key={n} value={n} className="bg-navy">{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-cream/60 mb-2 font-semibold uppercase tracking-wider">Room Category</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="input-field py-2 text-xs text-cream"
              >
                <option value="all" className="bg-navy">All Rooms & Villas</option>
                {roomsData.map(room => (
                  <option key={room.id} value={room.id} className="bg-navy">{room.name}</option>
                ))}
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full btn-primary py-3 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Check Rooms
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Tagline Section */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4">
        <p className="text-sunset uppercase tracking-[0.3em] text-xs font-semibold mb-4">Royal Grand Resort</p>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient mb-6 leading-tight">
          Where Timeless Heritage Meets Contemporary Luxury
        </h2>
        <p className="text-cream/75 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Enveloped by pristine cliffside shorelines and lush tropical gardens, Royal Grand stands as a beacon of 5-star hospitality. Relax in architectural marvels, restore balance in our spa, and embark on gourmet culinary adventures.
        </p>
      </section>

      {/* Featured Rooms Showcase */}
      <section className="py-16 bg-navy-light/10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div className="text-left">
              <p className="text-sunset uppercase tracking-widest text-xs font-semibold mb-2">Accommodations</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">Luxury Stay Collection</h2>
            </div>
            <Link to="/rooms" className="text-xs font-bold text-sunset hover:text-gold flex items-center gap-1 uppercase tracking-widest transition-colors">
              All Rooms &rarr;
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roomsData.slice(0, 3).map((room) => (
              <div key={room.id} className="glass rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group">
                <div className="relative h-56 overflow-hidden">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-navy/80 px-3 py-1 rounded-lg border border-white/10 text-xs font-semibold text-gold">
                    ₹{room.price.toLocaleString()} / night
                  </div>
                </div>
                <div className="p-6 text-left flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-cream mb-2 group-hover:text-gold transition-colors">{room.name}</h3>
                    <p className="text-cream/60 text-xs leading-relaxed mb-4 line-clamp-2">{room.description}</p>
                    <div className="flex gap-4 mb-6 text-xs text-cream/40 border-b border-white/5 pb-3">
                      <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {room.bed}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {room.capacity}</span>
                    </div>
                  </div>
                  <Link to={`/rooms?roomType=${room.id}`} className="w-full text-center py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-cream hover:bg-white/5 transition-colors">
                    Explore Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Restaurant Preview (Royal Bites) */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-sunset/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Image Showcase */}
            <div className="relative rounded-3xl overflow-hidden glass p-2 group shadow-xl">
              <div className="relative h-[300px] sm:h-[400px] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80" 
                  alt="Royal Bites Restaurant Lobby" 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-left">
                  <span className="px-2.5 py-0.5 rounded-full bg-sunset/20 text-sunset text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Fine Dining</span>
                  <h3 className="font-display text-2xl font-bold text-cream">Royal Bites Dining Room</h3>
                </div>
              </div>
            </div>

            {/* Right Column: Descriptions */}
            <div className="text-left space-y-6">
              <p className="text-sunset uppercase tracking-[0.25em] text-xs font-semibold">Gastronomy</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient">Royal Bites Restaurant</h2>
              <p className="text-cream/70 text-sm sm:text-base leading-relaxed">
                As the signature culinary brand of the resort, **Royal Bites** serves Michelin-style delicacies and traditional cuisines. Under the stewardship of award-winning chefs, enjoy fine dining in our gold-hued lounges, or place room service orders directly from your cart.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 text-xs text-cream/60">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <p className="font-bold text-cream mb-1">Gourmet Cuisines</p>
                  <p>Hand-crafted pizzas, Indian specialties, fresh salads, and dessert platters.</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <p className="font-bold text-cream mb-1">Room Delivery & Takeaway</p>
                  <p>Order online, customize items, and track orders directly in real-time.</p>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Link to="/menu" className="btn-primary py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  Order Food & View Menu
                </Link>
                <Link to="/booking?tab=table" className="btn-secondary py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  Reserve a Table
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spa Preview */}
      <section className="py-20 bg-navy-light/10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="text-left space-y-6 order-2 lg:order-1">
              <p className="text-sunset uppercase tracking-[0.25em] text-xs font-semibold">Rejuvenation</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">Spa & Wellness Sanctuary</h2>
              <p className="text-cream/70 text-sm sm:text-base leading-relaxed">
                Retreat to a nirvana of utter calm. Pamper your senses with luxury Ayurvedic oils, stone therapies, and mineral scrubs. Our expert therapists personalize each treatment to revitalize your body and clarify the mind.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-cream/65">
                <li className="flex items-center gap-2">✓ Ayurvedic oil massages & facials</li>
                <li className="flex items-center gap-2">✓ Herbal steam inhalation chambers</li>
                <li className="flex items-center gap-2">✓ Premium couple therapy packages</li>
              </ul>
              <div className="pt-2">
                <Link to="/spa" className="btn-primary py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  Explore Spa Sanctuary
                </Link>
              </div>
            </div>

            {/* Right Column Image */}
            <div className="relative rounded-3xl overflow-hidden glass p-2 group shadow-xl order-1 lg:order-2">
              <div className="relative h-[300px] sm:h-[380px] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80" 
                  alt="Spa Sanctuary Rejuvenation" 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events & Banquets Preview */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column Image */}
            <div className="relative rounded-3xl overflow-hidden glass p-2 group shadow-xl">
              <div className="relative h-[300px] sm:h-[380px] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80" 
                  alt="Resort Empress Grand Ballroom Wedding Gala" 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right Column Text */}
            <div className="text-left space-y-6">
              <p className="text-sunset uppercase tracking-[0.25em] text-xs font-semibold">Memorable Occasions</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient">Banquets & Celebrations</h2>
              <p className="text-cream/70 text-sm sm:text-base leading-relaxed">
                Whether organizing an executive corporate summit in high-tech boardrooms, a grandiose ballroom gala, or a fairytale wedding on sea-cliff lawns, our banquets staff guarantees an uncompromised 5-star affair.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-cream/65">
                <li className="flex items-center gap-2">✓ The Grand Empress Ballroom (up to 500 guests)</li>
                <li className="flex items-center gap-2">✓ Royal Pavilion Ocean Lawn (outdoor wedding lawns)</li>
                <li className="flex items-center gap-2">✓ Executive audiovisual boardrooms</li>
              </ul>
              <div className="pt-2">
                <Link to="/events" className="btn-primary py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  Plan Your Event
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Offers Preview */}
      <section className="py-20 bg-navy-light/10 border-t border-[#C0C0C0]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div className="text-left">
              <p className="text-sunset uppercase tracking-widest text-xs font-semibold mb-2">Special Promotions</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">Exclusive Resort Offers</h2>
            </div>
            <Link to="/offers" className="text-xs font-bold text-sunset hover:text-gold flex items-center gap-1 uppercase tracking-widest transition-colors">
              All Offers &rarr;
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {hotelOffers.map((offer) => (
              <div key={offer.code} className="glass rounded-3xl p-6 border border-[#C0C0C0]/20 flex flex-col justify-between text-left group hover:border-sunset/40 transition-all duration-300">
                <div>
                  <span className="px-3 py-1 bg-sunset/10 text-sunset text-[10px] font-bold rounded-lg uppercase tracking-wider mb-4 inline-block">{offer.discount}</span>
                  <h3 className="font-display text-lg font-bold text-cream mb-2">{offer.title}</h3>
                  <p className="text-cream/60 text-xs leading-relaxed mb-4 line-clamp-3">{offer.description}</p>
                </div>
                <div className="pt-4 border-t border-[#C0C0C0]/10 flex items-center justify-between">
                  <span className="text-[10px] text-cream/40">{offer.validity}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(offer.code);
                      showSuccess(`Promo code ${offer.code} copied!`);
                    }}
                    className="text-xs font-bold text-sunset hover:underline cursor-pointer"
                  >
                    Copy Code: {offer.code}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-24 border-t border-[#C0C0C0]/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div className="text-left">
              <p className="text-sunset uppercase tracking-widest text-xs font-semibold mb-2">Vistas</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">A Visual Journey</h2>
            </div>
            <Link to="/gallery" className="text-xs font-bold text-sunset hover:text-gold flex items-center gap-1 uppercase tracking-widest transition-colors">
              Full Gallery &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.slice(0, 4).map((img, idx) => (
              <div key={idx} className="relative h-64 rounded-3xl overflow-hidden glass p-1 group shadow-lg">
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <img 
                    src={img.url} 
                    alt={img.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-left pointer-events-none">
                    <span className="text-[9px] text-sunset uppercase tracking-wider font-semibold">{img.category}</span>
                    <h4 className="text-xs font-bold text-cream mt-0.5">{img.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />

      <Footer />
      <WhatsAppButton number={whatsappNumber} />
      <Chatbot onWhatsApp={() => openWhatsApp(whatsappNumber)} />
    </>
  );
}
