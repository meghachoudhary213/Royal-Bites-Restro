import { useState, useEffect } from 'react';
import { spaServices } from '../data/hotel';
import { Clock, Shield, Sparkles, CheckCircle } from 'lucide-react';
import { showSuccess, showError } from '../utils/toast';
import { api } from '../api/api';
import Footer from '../components/Footer';

export default function SpaPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [spaForm, setSpaForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    therapistPreference: 'None',
    specialRequests: ''
  });
  const [isBooked, setIsBooked] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchServices = async () => {
      try {
        const res = await api.getSpaServices();
        if (res.success && res.data && res.data.length > 0) {
          setServices(res.data);
        } else {
          setServices(spaServices);
        }
      } catch (err) {
        console.warn('Failed to fetch spa services from backend, using local fallback:', err.message);
        setServices(spaServices);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleOpenBooking = (service) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    setSelectedService(service);
    setSpaForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      therapistPreference: 'None',
      specialRequests: ''
    });
    setIsBooked(false);
    setConfirmedBookingId('');
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!spaForm.name || !spaForm.email || !spaForm.phone || !spaForm.date || !spaForm.time) {
      showError('Please fill in all required fields.');
      return;
    }

    // Past date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(spaForm.date);
    if (selectedDate < today) {
      showError('Cannot book appointments in the past.');
      return;
    }

    const payload = {
      guestName: spaForm.name,
      phone: spaForm.phone,
      email: spaForm.email,
      service: selectedService.name,
      appointmentDate: spaForm.date,
      appointmentTime: spaForm.time,
      therapistPreference: spaForm.therapistPreference,
      specialRequests: spaForm.specialRequests
    };

    let appointmentId = '';
    try {
      const res = await api.createSpaBooking(payload);
      if (res.success) {
        appointmentId = res.data.appointmentId;
      }
    } catch (apiError) {
      console.warn('Backend spa booking failed, falling back to local storage simulation:', apiError.message);
      appointmentId = `SPA-${Date.now()}`;
      
      // Sync in local storage
      const localBooking = {
        appointmentId,
        guestName: spaForm.name,
        phone: spaForm.phone,
        email: spaForm.email,
        service: selectedService.name,
        appointmentDate: spaForm.date,
        appointmentTime: spaForm.time,
        therapistPreference: spaForm.therapistPreference,
        specialRequests: spaForm.specialRequests,
        status: 'Pending',
        totalAmount: selectedService.price,
        createdAt: new Date().toISOString()
      };
      const localBookings = JSON.parse(localStorage.getItem('rb_spa_bookings') || '[]');
      localStorage.setItem('rb_spa_bookings', JSON.stringify([localBooking, ...localBookings]));
    }

    setConfirmedBookingId(appointmentId);
    setIsBooked(true);
    showSuccess(`Spa appointment confirmed for ${selectedService.name}!`);

    // Notify administrators / update tabs if listening
    try {
      const pendingAdminNotifs = JSON.parse(localStorage.getItem('rb_pending_admin_notifs') || '[]');
      pendingAdminNotifs.push({ type: 'spa_booking', name: spaForm.name, time: Date.now() });
      localStorage.setItem('rb_pending_admin_notifs', JSON.stringify(pendingAdminNotifs));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-navy text-cream pt-28">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-sunset/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-[600px] h-[600px] bg-pink/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sunset uppercase tracking-[0.25em] text-xs font-semibold mb-3">Rejuvenation</p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-gradient mb-6">Spa & Wellness Sanctuary</h1>
          <p className="text-cream/70 text-sm sm:text-base leading-relaxed">
            Reclaim your inner harmony. Our sanctuary combines ancient Eastern practices with modern skin wellness. Indulge in bespoke massages, facials, and detoxification therapies administered by certified therapists.
          </p>
        </div>

        {/* Spa Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-sm text-cream/60">Loading sanctuary therapies...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-8 mb-20">
            {services.map((service) => (
              <div 
                key={service._id || service.id} 
                className="glass rounded-3xl overflow-hidden border border-white/10 flex flex-col sm:flex-row hover:border-white/20 transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden shrink-0">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-display text-xl font-bold text-cream group-hover:text-gold transition-colors">{service.name}</h3>
                    <div className="flex gap-4 my-2 text-xs text-cream/50">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {service.duration}</span>
                      <span className="text-gold font-semibold">₹{service.price.toLocaleString()}</span>
                    </div>
                    <p className="text-cream/60 text-xs sm:text-sm mt-2 leading-relaxed">{service.description}</p>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(service)}
                    className="mt-5 text-xs font-semibold text-sunset hover:text-gold flex items-center gap-1 transition-colors uppercase tracking-widest cursor-pointer border-0 bg-transparent self-start"
                  >
                    Book Treatment &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Spa Policy Panel */}
        <div className="glass-strong rounded-3xl p-8 max-w-4xl mx-auto border border-white/15">
          <h2 className="font-display text-2xl font-bold text-gradient text-center mb-6">Sanctuary Etiquette & Amenities</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Clock, title: "Arrival Time", desc: "Please arrive 15 minutes before your schedule to allow changing and consultation." },
              { icon: Shield, title: "Sanitized Environment", desc: "All therapy suites are sterilized after every session. We use organic oils." },
              { icon: Sparkles, title: "Resort Facilities", desc: "Complimentary access to our steam chamber and jacuzzi lounge before treatments." }
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="space-y-2">
                <div className="w-10 h-10 bg-sunset/20 text-sunset rounded-2xl flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-cream font-semibold text-sm">{title}</h4>
                <p className="text-cream/50 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spa Booking Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-dark/80 backdrop-blur-md transition-all duration-300 p-4">
          <div className="glass-strong border border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedService(null)} 
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/15 text-cream/70 hover:text-cream cursor-pointer transition-colors z-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!isBooked ? (
              <form onSubmit={handleBookingSubmit} className="p-6 sm:p-8 space-y-4">
                <div className="text-center pb-2 border-b border-white/5">
                  <p className="text-xs text-sunset uppercase tracking-wider">Book Therapy Session</p>
                  <h3 className="font-display text-lg font-bold text-gradient mt-1">{selectedService.name}</h3>
                  <p className="text-xs text-cream/50 mt-1">{selectedService.duration} / ₹{selectedService.price.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={spaForm.name}
                    onChange={(e) => setSpaForm({...spaForm, name: e.target.value})}
                    required
                    placeholder="John Doe"
                    className="input-field py-2.5 text-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={spaForm.email}
                      onChange={(e) => setSpaForm({...spaForm, email: e.target.value})}
                      required
                      placeholder="your@email.com"
                      className="input-field py-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={spaForm.phone}
                      onChange={(e) => setSpaForm({...spaForm, phone: e.target.value})}
                      required
                      placeholder="Phone number"
                      className="input-field py-2.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Session Date</label>
                    <input
                      type="date"
                      value={spaForm.date}
                      onChange={(e) => setSpaForm({...spaForm, date: e.target.value})}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field py-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Preferred Time</label>
                    <input
                      type="time"
                      value={spaForm.time}
                      onChange={(e) => setSpaForm({...spaForm, time: e.target.value})}
                      required
                      className="input-field py-2.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-1.5">Therapist Preference</label>
                  <select
                    value={spaForm.therapistPreference}
                    onChange={(e) => setSpaForm({...spaForm, therapistPreference: e.target.value})}
                    className="input-field py-2.5 text-xs bg-navy text-cream"
                  >
                    <option value="None">No Preference (First Available)</option>
                    <option value="Male">Male Therapist</option>
                    <option value="Female">Female Therapist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-1.5">Special Considerations (e.g. Allergies, Special Requests)</label>
                  <textarea
                    value={spaForm.specialRequests}
                    onChange={(e) => setSpaForm({...spaForm, specialRequests: e.target.value})}
                    rows={2}
                    placeholder="Allergies, specific preferences, etc..."
                    className="input-field py-2 text-xs resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-primary py-3 rounded-xl font-semibold text-xs tracking-wider uppercase cursor-pointer mt-4"
                >
                  Request Session Appointment
                </button>
              </form>
            ) : (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-cream">Appointment Requested</h3>
                <p className="text-sm text-cream/70 leading-relaxed max-w-xs mx-auto">
                  Your appointment request for **{selectedService.name}** has been received. Our spa team will call you to confirm.
                </p>
                <div className="border border-white/5 rounded-2xl p-4 text-left text-xs text-cream/60 space-y-1.5 bg-white/5">
                  <p><span className="text-cream/40 font-mono">APPOINTMENT ID:</span> <span className="text-gold font-bold">{confirmedBookingId}</span></p>
                  <p><span className="text-cream/40 font-mono">SERVICE:</span> {selectedService.name}</p>
                  <p><span className="text-cream/40 font-mono">DATE:</span> {spaForm.date} at {spaForm.time}</p>
                  <p><span className="text-cream/40 font-mono">THERAPIST:</span> {spaForm.therapistPreference === 'None' ? 'No Preference' : `${spaForm.therapistPreference} Therapist`}</p>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-6 py-2.5 bg-gradient-to-r from-sunset to-sunset-dark text-cream font-bold rounded-xl text-xs hover:opacity-90 cursor-pointer"
                >
                  Back to Spa page
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
