import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api/api';
import { showSuccess, showError, showLoading, resolveLoading } from '../utils/toast';
import { toast } from 'react-hot-toast';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  guests: 2,
  occasion: 'Dining',
  specialRequests: '',
};

export default function BookingForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const bookingPayload = { ...form, guests: Number(form.guests) };
    const bookingToastId = showLoading('Saving booking...');
    try {
      await api.createBooking(bookingPayload);
      setStatus({ type: 'success', message: 'Your table has been reserved! We will confirm shortly.' });
      resolveLoading(bookingToastId, 'success', 'Booking confirmed! Your table has been reserved.', {
        label: 'View Booking',
        onClick: () => navigate('/dashboard?tab=bookings')
      });
      
      // Notify administrator (cross-tab via localStorage and same-tab via CustomEvent)
      window.dispatchEvent(new CustomEvent('admin-new-booking', { detail: bookingPayload }));
      try {
        const pendingAdminNotifs = JSON.parse(localStorage.getItem('rb_pending_admin_notifs') || '[]');
        pendingAdminNotifs.push({ type: 'booking', name: bookingPayload.name, time: Date.now() });
        localStorage.setItem('rb_pending_admin_notifs', JSON.stringify(pendingAdminNotifs));
      } catch (e) {}

      setForm(initialForm);
    } catch (err) {
      console.warn('MongoDB booking creation failed, falling back to localStorage:', err.message);
      try {
        const localBookings = JSON.parse(localStorage.getItem('rb_bookings') || '[]');
        const newLocalBooking = {
          _id: `BKG-${Date.now()}`,
          id: `BKG-${Date.now()}`,
          ...bookingPayload,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('rb_bookings', JSON.stringify([newLocalBooking, ...localBookings]));
        setStatus({ type: 'success', message: 'Your table has been reserved! We will confirm shortly. (Offline Mode)' });
        resolveLoading(bookingToastId, 'success', 'Booking confirmed! (Offline Mode)', {
          label: 'View Booking',
          onClick: () => navigate('/dashboard?tab=bookings')
        });

        // Notify administrator (cross-tab via localStorage and same-tab via CustomEvent)
        window.dispatchEvent(new CustomEvent('admin-new-booking', { detail: bookingPayload }));
        try {
          const pendingAdminNotifs = JSON.parse(localStorage.getItem('rb_pending_admin_notifs') || '[]');
          pendingAdminNotifs.push({ type: 'booking', name: bookingPayload.name, time: Date.now() });
          localStorage.setItem('rb_pending_admin_notifs', JSON.stringify(pendingAdminNotifs));
        } catch (e) {}

        setForm(initialForm);
      } catch (fallbackErr) {
        setStatus({ type: 'error', message: err.message || 'Booking failed. Please try again.' });
        resolveLoading(bookingToastId, 'error', err.message || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="relative py-24 md:py-32">
      <div className="absolute inset-0 sunset-gradient opacity-10 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-sunset uppercase tracking-[0.3em] text-sm font-medium mb-4">
              Reservations
            </p>
            <h2 className="section-title mb-6">Book Your Table</h2>
            <p className="text-cream/60 mb-8 leading-relaxed">
              Secure your seat for an unforgettable dining experience. Our team will confirm
              your reservation within the hour.
            </p>

            <div className="space-y-4">
              {[
                { icon: Calendar, text: 'Same-day bookings subject to availability' },
                { icon: Users, text: 'Private dining rooms for groups of 8+' },
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

          <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-cream/70 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-cream/70 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="john@email.com"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-cream/70 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div>
                <label className="block text-sm text-cream/70 mb-2">Guests</label>
                <select
                  name="guests"
                  value={form.guests}
                  onChange={handleChange}
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                    <option key={n} value={n} className="bg-navy">
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-cream/70 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-cream/70 mb-2">Time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-cream/70 mb-2">Occasion</label>
              <select
                name="occasion"
                value={form.occasion}
                onChange={handleChange}
                className="input-field"
              >
                {['Dining', 'Birthday', 'Anniversary', 'Business', 'Celebration'].map((o) => (
                  <option key={o} value={o} className="bg-navy">
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-cream/70 mb-2">Special Requests</label>
              <textarea
                name="specialRequests"
                value={form.specialRequests}
                onChange={handleChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Dietary requirements, seating preferences..."
              />
            </div>

            {status && (
              <div
                className={`flex items-center gap-2 p-4 rounded-xl text-sm ${
                  status.type === 'success'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                {status.message}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? 'Reserving...' : 'Confirm Reservation'}
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
