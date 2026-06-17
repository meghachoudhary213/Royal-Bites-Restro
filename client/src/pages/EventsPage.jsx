import { useState, useEffect } from 'react';
import { eventsVenues } from '../data/hotel';
import { Users, Compass, CheckCircle } from 'lucide-react';
import { showSuccess, showError } from '../utils/toast';
import Footer from '../components/Footer';

export default function EventsPage() {
  const [selectedVenue, setSelectedVenue] = useState(eventsVenues[0]);
  const [eventForm, setEventForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'Wedding',
    eventDate: '',
    guestCount: 100,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (!eventForm.name || !eventForm.email || !eventForm.phone || !eventForm.eventDate) {
      showError('Please fill in all contact and date details.');
      setLoading(false);
      return;
    }

    const newInquiry = {
      id: `EVT-${Date.now()}`,
      venueName: selectedVenue.name,
      ...eventForm,
      status: 'Pending Review',
      createdAt: new Date().toLocaleDateString()
    };

    // Store event inquiries in localStorage
    const localInquiries = JSON.parse(localStorage.getItem('rb_event_bookings') || '[]');
    localStorage.setItem('rb_event_bookings', JSON.stringify([newInquiry, ...localInquiries]));

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showSuccess(`Inquiry submitted for ${selectedVenue.name}!`);
    }, 800);
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
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-gradient mb-6">Venues & Banquets</h1>
          <p className="text-cream/70 text-sm sm:text-base leading-relaxed">
            Host your grandeur events with 5-star perfection. From high-society weddings on our sea-facing lawns to executive board meetings and grand corporate galas, our dedicated banquet staff ensures flawless execution.
          </p>
        </div>

        {/* Layout: Left Venue Showcase, Right Inquiry Form */}
        <div className="grid lg:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Left: Venues Accordion/Details */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-display text-2xl font-bold text-cream mb-4">Select A Venue</h2>
            <div className="grid gap-4">
              {eventsVenues.map((venue) => {
                const isSelected = selectedVenue.id === venue.id;
                return (
                  <div 
                    key={venue.id}
                    onClick={() => {
                      setSelectedVenue(venue);
                      setSubmitted(false);
                    }}
                    className={`glass p-5 rounded-3xl border transition-all duration-300 cursor-pointer text-left flex flex-col md:flex-row gap-5 ${
                      isSelected ? 'border-sunset bg-white/5 ring-1 ring-sunset' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-full md:w-40 h-28 rounded-2xl overflow-hidden shrink-0 bg-navy/60">
                      <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-display text-lg font-bold text-cream">{venue.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream/50">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {venue.capacity}</span>
                        <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5" /> {venue.size}</span>
                        <span className="text-gold font-semibold">{venue.type}</span>
                      </div>
                      <p className="text-cream/60 text-xs sm:text-sm pt-1.5 leading-relaxed">{venue.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Venue Booking Form */}
          <div className="lg:col-span-5 glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="text-center pb-2 border-b border-white/5">
                  <p className="text-xs text-sunset uppercase tracking-wider">Plan Your Event</p>
                  <h3 className="font-display text-xl font-bold text-gradient mt-1">{selectedVenue.name}</h3>
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={eventForm.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="input-field py-2 text-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={eventForm.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="input-field py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Mobile Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={eventForm.phone}
                      onChange={handleChange}
                      required
                      placeholder="Phone number"
                      className="input-field py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Event Type</label>
                    <select
                      name="eventType"
                      value={eventForm.eventType}
                      onChange={handleChange}
                      className="input-field py-2 text-xs text-cream"
                    >
                      {['Wedding', 'Conference', 'Gala Dinner', 'Corporate Retreat', 'Birthday Party', 'Private Dining'].map(type => (
                        <option key={type} value={type} className="bg-navy">{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Expected Guests</label>
                    <input
                      type="number"
                      name="guestCount"
                      value={eventForm.guestCount}
                      onChange={handleChange}
                      required
                      min={10}
                      className="input-field py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-1.5">Event Date</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={eventForm.eventDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-1.5">Custom Setup & Special Requests</label>
                  <textarea
                    name="message"
                    value={eventForm.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g. AV setup, catering package preference, layout specifications..."
                    className="input-field py-2 text-xs resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary py-3 rounded-xl font-semibold text-xs tracking-wider uppercase cursor-pointer mt-4"
                >
                  {loading ? 'Submitting Inquiry...' : 'Submit Venue Inquiry'}
                </button>
              </form>
            ) : (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-cream">Inquiry Submitted!</h3>
                <p className="text-sm text-cream/70 leading-relaxed">
                  Your event venue inquiry for **{selectedVenue.name}** has been successfully recorded. Our grand event director will contact you via phone or email shortly.
                </p>
                <div className="border border-white/5 rounded-2xl p-4 text-left text-xs text-cream/60 space-y-1 bg-white/5">
                  <p><span className="text-cream/40 font-mono">VENUE:</span> {selectedVenue.name}</p>
                  <p><span className="text-cream/40 font-mono">DATE:</span> {eventForm.eventDate}</p>
                  <p><span className="text-cream/40 font-mono">TYPE:</span> {eventForm.eventType} ({eventForm.guestCount} guests)</p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-sunset to-sunset-dark text-cream font-bold rounded-xl text-xs hover:opacity-90 cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trust Section */}
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

      <Footer />
    </div>
  );
}
