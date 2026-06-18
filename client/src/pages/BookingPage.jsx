import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';
import { roomsData } from '../data/hotel';
import { Calendar, Users, Send, CheckCircle, Award, Coffee, Home } from 'lucide-react';
import { showSuccess, showError } from '../utils/toast';
import { api } from '../api/api';

export default function BookingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'room';

  // Room booking form state
  const [roomForm, setRoomForm] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: Number(searchParams.get('guests')) || 2,
    roomType: searchParams.get('roomType') || 'presidential-suite',
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const selectedRoom = roomsData.find(r => r.id === roomForm.roomType) || roomsData[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fill user details if logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      setRoomForm(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      }));
    }
  }, []);

  // Sync state if search params change
  useEffect(() => {
    setRoomForm(prev => ({
      ...prev,
      checkIn: searchParams.get('checkIn') || prev.checkIn,
      checkOut: searchParams.get('checkOut') || prev.checkOut,
      guests: Number(searchParams.get('guests')) || prev.guests,
      roomType: searchParams.get('roomType') || prev.roomType,
    }));
  }, [searchParams]);

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!roomForm.name || !roomForm.email || !roomForm.phone || !roomForm.checkIn || !roomForm.checkOut) {
      showError('Please fill in all contact and reservation details.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        roomType: selectedRoom.name,
        guestName: roomForm.name,
        phone: roomForm.phone,
        email: roomForm.email,
        checkIn: roomForm.checkIn,
        checkOut: roomForm.checkOut,
        guests: roomForm.guests,
        specialRequests: roomForm.specialRequests
      };

      const res = await api.createRoomBooking(payload);
      if (res.success) {
        setCreatedBooking(res.data);
        setIsBooked(true);
        showSuccess(`Room booking inquiry confirmed!`);
      }
    } catch (err) {
      console.warn('API booking failed, falling back to local simulation:', err.message);
      // Fallback
      const newBooking = {
        id: `RM-${Date.now()}`,
        bookingId: `RM-${Date.now()}`,
        roomName: selectedRoom.name,
        roomPrice: selectedRoom.price,
        image: selectedRoom.image,
        ...roomForm,
        status: 'Pending',
        totalPrice: selectedRoom.price * 1, // fallback
        date: new Date().toLocaleDateString()
      };
      const localBookings = JSON.parse(localStorage.getItem('rb_room_bookings') || '[]');
      localStorage.setItem('rb_room_bookings', JSON.stringify([newBooking, ...localBookings]));
      setCreatedBooking(newBooking);
      setIsBooked(true);
      showSuccess(`Room booking simulated!`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setIsBooked(false);
  };

  return (
    <div className="min-h-screen bg-navy text-cream pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Reservation Tab Selector */}
        <div className="flex justify-center max-w-md mx-auto mb-10 mt-6 glass p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => handleTabChange('room')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 ${
              activeTab === 'room'
                ? 'bg-gradient-to-r from-sunset to-gold-dark text-cream shadow-md'
                : 'text-cream/60 hover:text-cream bg-transparent'
            }`}
          >
            Book A Room
          </button>
          <button
            onClick={() => handleTabChange('table')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 ${
              activeTab === 'table'
                ? 'bg-gradient-to-r from-sunset to-gold-dark text-cream shadow-md'
                : 'text-cream/60 hover:text-cream bg-transparent'
            }`}
          >
            Book A Table
          </button>
        </div>

        {activeTab === 'room' ? (
          <section id="room-booking" className="relative py-8">
            <div className="absolute inset-0 sunset-gradient opacity-10 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="text-left">
                  <p className="text-sunset uppercase tracking-[0.3em] text-sm font-medium mb-4">
                    Resort Reservations
                  </p>
                  <h2 className="section-title mb-6">Book Your Luxury Stay</h2>
                  <p className="text-cream/60 mb-8 leading-relaxed">
                    Choose from our luxury suites or botanical garden villas. 
                    Your reservation details will be logged, and our team will get in touch to customize your itinerary.
                  </p>

                  <div className="space-y-4">
                    {[
                      { icon: Coffee, text: 'Complimentary gourmet breakfast included' },
                      { icon: Award, text: '24/7 personal butler service for suites' },
                      { icon: Home, text: 'Priority seating at Royal Bites Restaurant' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 text-cream/70">
                        <div className="p-2 rounded-lg bg-sunset/20">
                          <Icon className="w-5 h-5 text-sunset" />
                        </div>
                        <span className="text-sm">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-strong rounded-3xl p-8 space-y-5">
                  {!isBooked ? (
                    <form onSubmit={handleRoomSubmit} className="space-y-4 text-left">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-cream/70 mb-1.5">Full Name</label>
                          <input
                            type="text"
                            value={roomForm.name}
                            onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                            required
                            placeholder="John Doe"
                            className="input-field py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-cream/70 mb-1.5">Email Address</label>
                          <input
                            type="email"
                            value={roomForm.email}
                            onChange={(e) => setRoomForm({...roomForm, email: e.target.value})}
                            required
                            placeholder="your@email.com"
                            className="input-field py-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-cream/70 mb-1.5">Phone Number</label>
                          <input
                            type="tel"
                            value={roomForm.phone}
                            onChange={(e) => setRoomForm({...roomForm, phone: e.target.value})}
                            required
                            placeholder="Phone number"
                            className="input-field py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-cream/70 mb-1.5">Room Category</label>
                          <select
                            value={roomForm.roomType}
                            onChange={(e) => setRoomForm({...roomForm, roomType: e.target.value})}
                            className="input-field py-2 text-xs text-cream"
                          >
                            {roomsData.map(room => (
                              <option key={room.id} value={room.id} className="bg-navy">{room.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                          <label className="block text-xs text-cream/70 mb-1.5">Guests</label>
                          <select
                            value={roomForm.guests}
                            onChange={(e) => setRoomForm({...roomForm, guests: Number(e.target.value)})}
                            className="input-field py-2 text-xs text-cream"
                          >
                            {[1, 2, 3, 4, 6].map(n => (
                              <option key={n} value={n} className="bg-navy">{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-cream/70 mb-1.5">Check-In</label>
                          <input
                            type="date"
                            value={roomForm.checkIn}
                            onChange={(e) => setRoomForm({...roomForm, checkIn: e.target.value})}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="input-field py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-cream/70 mb-1.5">Check-Out</label>
                          <input
                            type="date"
                            value={roomForm.checkOut}
                            onChange={(e) => setRoomForm({...roomForm, checkOut: e.target.value})}
                            required
                            min={roomForm.checkIn || new Date().toISOString().split('T')[0]}
                            className="input-field py-2 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-cream/70 mb-1.5">Special Requests</label>
                        <textarea
                          value={roomForm.specialRequests}
                          onChange={(e) => setRoomForm({...roomForm, specialRequests: e.target.value})}
                          rows={3}
                          placeholder="e.g. Airport shuttle details, allergy warnings, extra bed..."
                          className="input-field py-2 text-xs resize-none"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full btn-primary py-3 rounded-xl font-semibold text-xs tracking-wider uppercase cursor-pointer"
                      >
                        {loading ? 'Submitting Reservation...' : 'Confirm Stay Inquiry'}
                      </button>
                    </form>
                  ) : (
                    <div className="p-8 text-center space-y-5">
                      <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-cream">Stay Reserved!</h3>
                      <p className="text-sm text-cream/70 leading-relaxed">
                        Your stay request has been confirmed.
                      </p>
                      <div className="border border-white/5 rounded-2xl p-4 text-left text-xs text-cream/60 space-y-1 bg-white/5 max-w-sm mx-auto">
                        <p><span className="text-cream/40 font-mono">BOOKING ID:</span> <span className="font-bold text-gold font-mono">{createdBooking?.bookingId || createdBooking?.id}</span></p>
                        <p><span className="text-cream/40 font-mono">DATES:</span> {roomForm.checkIn} to {roomForm.checkOut}</p>
                        <p><span className="text-cream/40 font-mono">GUESTS:</span> {roomForm.guests} Persons</p>
                        <p><span className="text-cream/40 font-mono">ESTIMATED TOTAL:</span> ₹{(createdBooking?.totalPrice || selectedRoom.price)?.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => navigate('/dashboard?tab=bookings')}
                        className="px-6 py-2.5 bg-gradient-to-r from-sunset to-sunset-dark text-cream font-bold rounded-xl text-xs hover:opacity-90 cursor-pointer"
                      >
                        View My Bookings
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <BookingForm />
        )}
      </div>
      <Footer />
    </div>
  );
}
