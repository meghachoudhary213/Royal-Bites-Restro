import { useState, useEffect } from 'react';
import { Users, Compass, CheckCircle, Sparkles, Calendar, Clock } from 'lucide-react';
import { showSuccess, showError } from '../utils/toast';
import { api } from '../api/api';
import Footer from '../components/Footer';

// Fallback default packages if API fails
const defaultPackages = [
  {
    _id: 'pkg-1',
    name: 'Royal Wedding Package',
    category: 'Wedding',
    description: 'The ultimate fairytale experience on our sea-facing lawns. Includes premium catering, complete floral decor, bridal suite, stage set, and sound.',
    capacity: 500,
    price: 1500000,
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    _id: 'pkg-2',
    name: 'Premium Wedding Package',
    category: 'Wedding',
    description: 'Elegant celebration in the grand ballroom. Includes standard decor, buffet dining by Royal Bites, guest seating, and stage setup.',
    capacity: 300,
    price: 800000,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    _id: 'pkg-3',
    name: 'Corporate Conference Package',
    category: 'Corporate',
    description: 'Outfitted with high-speed video conferencing suites, automated projector systems, executive seating, and connection to private pantry.',
    capacity: 50,
    price: 150000,
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    _id: 'pkg-4',
    name: 'Birthday Celebration Package',
    category: 'Birthday',
    description: 'Vibrant birthday setup with balloon decorations, custom cake option, DJ system, and live food counters by Royal Bites.',
    capacity: 150,
    price: 250000,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    _id: 'pkg-5',
    name: 'Luxury Banquet Package',
    category: 'Conference',
    description: 'Grand gala dinners and award ceremonies. Features high-definition LED backdrops, customized seating styles, and multi-cuisine dining.',
    capacity: 400,
    price: 600000,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    isActive: true
  }
];

export default function EventsPage() {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [eventForm, setEventForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'Wedding',
    eventDate: '',
    guestCount: 100,
    specialRequirements: ''
  });
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchPackages = async () => {
      try {
        const res = await api.getEventPackages();
        if (res.success && res.data && res.data.length > 0) {
          setPackages(res.data);
        } else {
          setPackages(defaultPackages);
        }
      } catch (err) {
        console.warn('Failed to fetch event packages from backend, using fallback:', err.message);
        setPackages(defaultPackages);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleOpenBooking = (pkg) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    setSelectedPackage(pkg);
    setEventForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      eventType: pkg.category === 'Conference' ? 'Conference' : pkg.category,
      eventDate: new Date().toISOString().split('T')[0],
      guestCount: Math.min(100, pkg.capacity),
      specialRequirements: ''
    });
    setIsBooked(false);
    setConfirmedBookingId('');
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.email || !eventForm.phone || !eventForm.eventDate || !eventForm.guestCount) {
      showError('Please fill in all required fields.');
      return;
    }

    // Past date check
    const dateParts = eventForm.eventDate.split('-');
    if (dateParts.length === 3) {
      const bookingYear = parseInt(dateParts[0], 10);
      const bookingMonth = parseInt(dateParts[1], 10);
      const bookingDay = parseInt(dateParts[2], 10);

      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();

      if (
        bookingYear < todayYear ||
        (bookingYear === todayYear && bookingMonth < todayMonth) ||
        (bookingYear === todayYear && bookingMonth === todayMonth && bookingDay < todayDay)
      ) {
        showError('Cannot book event dates in the past.');
        return;
      }
    }

    // Guest count check
    if (Number(eventForm.guestCount) > selectedPackage.capacity) {
      showError(`Guest count exceeds the maximum capacity of ${selectedPackage.capacity} guests for this package.`);
      return;
    }

    setBookingLoading(true);

    const payload = {
      guestName: eventForm.name,
      phone: eventForm.phone,
      email: eventForm.email,
      eventType: eventForm.eventType,
      package: selectedPackage.name,
      eventDate: eventForm.eventDate,
      guestCount: Number(eventForm.guestCount),
      specialRequirements: eventForm.specialRequirements
    };

    let bookingId = '';
    try {
      const res = await api.createEventBooking(payload);
      if (res.success) {
        bookingId = res.data.bookingId;
      }
    } catch (apiError) {
      console.warn('Backend event booking failed, using local storage simulation:', apiError.message);
      bookingId = `EVT-${Date.now()}`;
      
      const localBooking = {
        bookingId,
        guestName: eventForm.name,
        phone: eventForm.phone,
        email: eventForm.email,
        eventType: eventForm.eventType,
        package: selectedPackage.name,
        eventDate: eventForm.eventDate,
        guestCount: Number(eventForm.guestCount),
        specialRequirements: eventForm.specialRequirements,
        status: 'Pending',
        totalAmount: selectedPackage.price,
        createdAt: new Date().toISOString()
      };
      
      const localBookings = JSON.parse(localStorage.getItem('rb_event_bookings') || '[]');
      localStorage.setItem('rb_event_bookings', JSON.stringify([localBooking, ...localBookings]));
    } finally {
      setBookingLoading(false);
    }

    setConfirmedBookingId(bookingId);
    setIsBooked(true);
    showSuccess(`Event requested successfully for ${selectedPackage.name}!`);

    // Notify administrators / update tabs if listening
    try {
      const pendingAdminNotifs = JSON.parse(localStorage.getItem('rb_pending_admin_notifs') || '[]');
      pendingAdminNotifs.push({ type: 'event_booking', name: eventForm.name, time: Date.now() });
      localStorage.setItem('rb_pending_admin_notifs', JSON.stringify(pendingAdminNotifs));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-navy text-cream pt-28">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-sunset/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-pink/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sunset uppercase tracking-[0.25em] text-xs font-semibold mb-3">Celebrations & Conferences</p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-gradient mb-6">Banquet & Event Packages</h1>
          <p className="text-cream/70 text-sm sm:text-base leading-relaxed">
            Host your grand celebrations and executive assemblies with 5-star perfection. From fairytale weddings on our sea-facing lawns to conferences and corporate galas, discover customized packages crafted for unforgettable experiences.
          </p>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-sm text-cream/60 animate-pulse">Loading event packages...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {packages.map((pkg) => (
              <div 
                key={pkg._id || pkg.id}
                className="glass rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all duration-300 group"
              >
                <div>
                  {/* Image */}
                  <div className="relative w-full h-52 overflow-hidden bg-navy/60">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-navy/80 border border-white/10 rounded-full text-[10px] font-bold text-sunset uppercase tracking-wider">
                      {pkg.category}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-6 space-y-4">
                    <h3 className="font-display text-xl font-bold text-cream group-hover:text-gold transition-colors">{pkg.name}</h3>
                    <p className="text-cream/60 text-xs sm:text-sm leading-relaxed line-clamp-3">{pkg.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-3 rounded-2xl border border-white/5">
                      <div>
                        <span className="block text-[8px] text-cream/40 uppercase tracking-wider">Max Capacity</span>
                        <span className="font-semibold text-cream flex items-center gap-1 mt-0.5"><Users className="w-3.5 h-3.5 text-gold" /> {pkg.capacity} Guests</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-cream/40 uppercase tracking-wider">Base Package Price</span>
                        <span className="font-bold text-gold text-sm mt-0.5">₹{pkg.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleOpenBooking(pkg)}
                    className="w-full btn-primary py-3 rounded-xl font-semibold text-xs tracking-wider uppercase cursor-pointer"
                  >
                    Select & Plan Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Catering Link */}
        <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-left max-w-4xl mx-auto">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-cream">Looking for Catering & Dining?</h3>
            <p className="text-cream/60 text-xs sm:text-sm">
              Our signature dining brand **Royal Bites** provides customized gourmet catering packages for all resort banquets.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/menu'} 
            className="btn-secondary py-2.5 px-6 rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
          >
            Explore Royal Bites Menu
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-dark/80 backdrop-blur-md transition-all duration-300 p-4">
          <div className="glass-strong border border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedPackage(null)} 
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/15 text-cream/70 hover:text-cream cursor-pointer transition-colors z-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!isBooked ? (
              <form onSubmit={handleBookingSubmit} className="p-6 sm:p-8 space-y-4">
                <div className="text-center pb-2 border-b border-white/5">
                  <p className="text-xs text-sunset uppercase tracking-wider">Plan Resort Event</p>
                  <h3 className="font-display text-lg font-bold text-gradient mt-1">{selectedPackage.name}</h3>
                  <p className="text-xs text-cream/50 mt-1">Max Capacity: {selectedPackage.capacity} guests / Rate: ₹{selectedPackage.price.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                    required
                    placeholder="John Doe"
                    className="input-field py-2.5 text-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={eventForm.email}
                      onChange={(e) => setEventForm({...eventForm, email: e.target.value})}
                      required
                      placeholder="your@email.com"
                      className="input-field py-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={eventForm.phone}
                      onChange={(e) => setEventForm({...eventForm, phone: e.target.value})}
                      required
                      placeholder="Phone number"
                      className="input-field py-2.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Event Type</label>
                    <select
                      value={eventForm.eventType}
                      onChange={(e) => setEventForm({...eventForm, eventType: e.target.value})}
                      className="input-field py-2.5 text-xs bg-navy text-cream"
                    >
                      {['Wedding', 'Conference', 'Gala Dinner', 'Corporate Retreat', 'Birthday Party', 'Banquet'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Expected Guests</label>
                    <input
                      type="number"
                      value={eventForm.guestCount}
                      onChange={(e) => setEventForm({...eventForm, guestCount: e.target.value})}
                      required
                      min={10}
                      max={selectedPackage.capacity}
                      className="input-field py-2.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-1.5">Event Date</label>
                  <input
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({...eventForm, eventDate: e.target.value})}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field py-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-1.5">Custom Setup & Special Requirements</label>
                  <textarea
                    value={eventForm.specialRequirements}
                    onChange={(e) => setEventForm({...eventForm, specialRequirements: e.target.value})}
                    rows={2}
                    placeholder="AV setup, catering menus, layout styling specifications..."
                    className="input-field py-2 text-xs resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={bookingLoading}
                  className="w-full btn-primary py-3 rounded-xl font-semibold text-xs tracking-wider uppercase cursor-pointer mt-4"
                >
                  {bookingLoading ? 'Reserving...' : 'Submit Event Request'}
                </button>
              </form>
            ) : (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-cream">Banquet Requested</h3>
                <p className="text-sm text-cream/70 leading-relaxed max-w-xs mx-auto">
                  Your event reservation request for **{selectedPackage.name}** has been received. Our event coordinator will contact you to finalize the contract.
                </p>
                <div className="border border-white/5 rounded-2xl p-4 text-left text-xs text-cream/60 space-y-1.5 bg-white/5">
                  <p><span className="text-cream/40 font-mono">BOOKING ID:</span> <span className="text-gold font-bold">{confirmedBookingId}</span></p>
                  <p><span className="text-cream/40 font-mono">PACKAGE:</span> {selectedPackage.name}</p>
                  <p><span className="text-cream/40 font-mono">SCHEDULE:</span> {eventForm.eventDate} ({eventForm.guestCount} guests)</p>
                </div>
                <button
                  onClick={() => setSelectedPackage(null)}
                  className="px-6 py-2.5 bg-gradient-to-r from-sunset to-sunset-dark text-cream font-bold rounded-xl text-xs hover:opacity-90 cursor-pointer"
                >
                  Back to Events page
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Inline helper close
const X = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
