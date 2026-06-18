import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { roomsData } from '../data/hotel';
import { Users, Coffee, Bed, Sparkles, CheckCircle } from 'lucide-react';
import { showSuccess, showError } from '../utils/toast';
import Footer from '../components/Footer';
import { api } from '../api/api';

// Pure date helper functions defined outside the component to follow pure render rules
const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getTomorrowDateString = (checkInDateStr) => {
  const baseDate = checkInDateStr ? new Date(checkInDateStr) : new Date();
  const tomorrow = new Date(baseDate.getTime() + 86400000);
  return tomorrow.toISOString().split('T')[0];
};

export default function RoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search state prefilled from URL query params
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '2');
  const [roomType, setRoomType] = useState(searchParams.get('roomType') || 'all');

  const [createdBooking, setCreatedBooking] = useState(null);

  // Booking Modal state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    specialRequests: ''
  });
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Sync modal form with search state when opening
  const handleOpenBooking = (room) => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    setSelectedRoom(room);
    setBookingForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      checkIn: checkIn || getTodayDateString(),
      checkOut: checkOut || getTomorrowDateString(checkIn),
      guests: Number(guests) || 2,
      specialRequests: ''
    });
    setIsBooked(false);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone) {
      showError('Please fill in all contact details.');
      return;
    }

    try {
      const payload = {
        roomType: selectedRoom.name,
        guestName: bookingForm.name,
        phone: bookingForm.phone,
        email: bookingForm.email,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guests: bookingForm.guests,
        specialRequests: bookingForm.specialRequests
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
        ...bookingForm,
        status: 'Pending',
        totalPrice: selectedRoom.price * 1, // simplified fallback
        date: new Date().toLocaleDateString()
      };
      const localBookings = JSON.parse(localStorage.getItem('rb_room_bookings') || '[]');
      localStorage.setItem('rb_room_bookings', JSON.stringify([newBooking, ...localBookings]));
      setCreatedBooking(newBooking);
      setIsBooked(true);
      showSuccess(`Room booking simulated!`);
    }
  };

  // Filter logic
  const filteredRooms = roomsData.filter(room => {
    if (roomType !== 'all' && room.id !== roomType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-navy text-cream pt-28">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sunset/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sunset uppercase tracking-[0.25em] text-xs font-semibold mb-3">Accommodation</p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-gradient mb-6">Luxury Suites & Villas</h1>
          <p className="text-cream/70 text-sm sm:text-base leading-relaxed">
            Experience absolute tranquility in our meticulously curated spaces. Designed with an elegant mix of modern architecture and classic 5-star comforts, every room offers a majestic sanctuary.
          </p>
        </div>

        {/* Quick Booking/Filter Search Bar */}
        <div className="glass rounded-3xl p-6 mb-16 border border-white/10 shadow-2xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
            <div>
              <label className="block text-xs text-cream/60 mb-2 font-medium tracking-wider uppercase">Check-In</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-cream/60 mb-2 font-medium tracking-wider uppercase">Check-Out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="input-field py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-cream/60 mb-2 font-medium tracking-wider uppercase">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="input-field py-2.5 text-sm"
              >
                {[1, 2, 3, 4, 6].map(n => (
                  <option key={n} value={n} className="bg-navy">{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-cream/60 mb-2 font-medium tracking-wider uppercase">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="input-field py-2.5 text-sm text-cream"
              >
                <option value="all" className="bg-navy">All Accommodations</option>
                {roomsData.map(room => (
                  <option key={room.id} value={room.id} className="bg-navy">{room.name}</option>
                ))}
              </select>
            </div>
            <div>
              <button
                onClick={() => setSearchParams({ checkIn, checkOut, guests, roomType })}
                className="w-full btn-primary py-3 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Search & Filter
              </button>
            </div>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          {filteredRooms.map((room) => (
            <div 
              key={room.id} 
              className="glass-strong rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col group"
            >
              {/* Image Container */}
              <div className="relative h-64 sm:h-80 overflow-hidden shrink-0">
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-transparent opacity-85" />
                <span className="absolute bottom-4 left-6 px-3 py-1 rounded-lg bg-navy/80 border border-white/10 text-xs font-semibold text-gold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-gold" /> {room.rating} Rating
                </span>
                <div className="absolute top-4 right-6 text-right">
                  <span className="text-[10px] text-cream/60 uppercase block tracking-wider leading-none">Starting from</span>
                  <span className="font-display text-2xl font-bold text-gradient">₹{room.price.toLocaleString()}</span>
                  <span className="text-xs text-cream/60"> / night</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-cream mb-3">{room.name}</h3>
                  <p className="text-cream/70 text-xs sm:text-sm leading-relaxed mb-6">{room.description}</p>
                  
                  {/* Features */}
                  <div className="flex gap-4 mb-6 border-b border-white/5 pb-4 text-xs text-cream/60">
                    <span className="flex items-center gap-1.5"><Bed className="w-4 h-4 text-sunset" /> {room.bed}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-sunset" /> {room.capacity}</span>
                    <span className="flex items-center gap-1.5"><Coffee className="w-4 h-4 text-sunset" /> {room.size}</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {room.amenities.map(amenity => (
                      <span 
                        key={amenity} 
                        className="px-2.5 py-1 text-[10px] sm:text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-cream/80"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenBooking(room)}
                  className="w-full btn-primary py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest cursor-pointer"
                >
                  Book This Suite
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-dark/80 backdrop-blur-md transition-all duration-300 p-4">
          <div className="glass-strong border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedRoom(null)} 
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/15 text-cream/70 hover:text-cream cursor-pointer transition-colors z-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!isBooked ? (
              <form onSubmit={handleBookingSubmit} className="p-6 sm:p-8 space-y-4">
                <div className="text-center pb-2 border-b border-white/5">
                  <p className="text-xs text-sunset uppercase tracking-wider">Book Room</p>
                  <h3 className="font-display text-xl font-bold text-gradient mt-1">{selectedRoom.name}</h3>
                  <p className="text-xs text-cream/50 mt-1">₹{selectedRoom.price.toLocaleString()} / night</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Check-In</label>
                    <input
                      type="date"
                      value={bookingForm.checkIn}
                      onChange={(e) => setBookingForm({...bookingForm, checkIn: e.target.value})}
                      required
                      min={getTodayDateString()}
                      className="input-field py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Check-Out</label>
                    <input
                      type="date"
                      value={bookingForm.checkOut}
                      onChange={(e) => setBookingForm({...bookingForm, checkOut: e.target.value})}
                      required
                      min={bookingForm.checkIn || getTodayDateString()}
                      className="input-field py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Guests</label>
                    <select
                      value={bookingForm.guests}
                      onChange={(e) => setBookingForm({...bookingForm, guests: Number(e.target.value)})}
                      className="input-field py-2 text-xs text-cream"
                    >
                      {[1, 2, 3, 4, 6].map(n => (
                        <option key={n} value={n} className="bg-navy">{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                      required
                      placeholder="Your name"
                      className="input-field py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                      required
                      placeholder="your@email.com"
                      className="input-field py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-cream/60 mb-1.5">Mobile Phone</label>
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                      required
                      placeholder="Phone number"
                      className="input-field py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-1.5">Special Inquiries / Requests</label>
                  <textarea
                    value={bookingForm.specialRequests}
                    onChange={(e) => setBookingForm({...bookingForm, specialRequests: e.target.value})}
                    rows={2}
                    placeholder="Dietary preferences, airport shuttle requests, extra bed..."
                    className="input-field py-2 text-xs resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-primary py-3 rounded-xl font-semibold text-xs tracking-wider uppercase cursor-pointer mt-4"
                >
                  Confirm Reservation Inquiry
                </button>
              </form>
            ) : (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-cream">Inquiry Confirmed!</h3>
                <p className="text-sm text-cream/70 leading-relaxed max-w-xs mx-auto">
                  Your booking request for **{selectedRoom.name}** has been secured.
                </p>
                <div className="border border-white/5 rounded-2xl p-4 text-left text-xs text-cream/60 space-y-1 bg-white/5">
                  <p><span className="text-cream/40 font-mono">BOOKING ID:</span> <span className="font-bold text-gold font-mono">{createdBooking?.bookingId || createdBooking?.id}</span></p>
                  <p><span className="text-cream/40 font-mono">DATES:</span> {bookingForm.checkIn} to {bookingForm.checkOut}</p>
                  <p><span className="text-cream/40 font-mono">GUESTS:</span> {bookingForm.guests} Persons</p>
                  <p><span className="text-cream/40 font-mono">ESTIMATED TOTAL:</span> ₹{(createdBooking?.totalPrice || selectedRoom.price)?.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="px-6 py-2.5 bg-gradient-to-r from-sunset to-sunset-dark text-cream font-bold rounded-xl text-xs hover:opacity-90 cursor-pointer"
                >
                  Close Panel
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

// Inline helper for closing
const X = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
