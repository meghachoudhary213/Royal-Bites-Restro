import { useState } from 'react';
import { ShoppingBag, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api/api';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  orderType: 'dine-in',
  items: '',
  message: '',
};

export default function InquiryForm() {
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
    try {
      await api.createInquiry(form);
      setStatus({
        type: 'success',
        message: 'Inquiry submitted! Our team will get back to you shortly.',
      });
      setForm(initialForm);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Submission failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="inquiry" className="relative py-24 md:py-32 bg-navy-light/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-8 space-y-5 order-2 lg:order-1">
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
                  placeholder="Your name"
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
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-cream/70 mb-2">Phone (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div>
                <label className="block text-sm text-cream/70 mb-2">Order Type</label>
                <select
                  name="orderType"
                  value={form.orderType}
                  onChange={handleChange}
                  className="input-field"
                >
                  {[
                    { value: 'dine-in', label: 'Dine In' },
                    { value: 'takeaway', label: 'Takeaway' },
                    { value: 'delivery', label: 'Delivery' },
                    { value: 'catering', label: 'Catering' },
                  ].map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-navy">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-cream/70 mb-2">Items / Order Details</label>
              <textarea
                name="items"
                value={form.items}
                onChange={handleChange}
                required
                rows={4}
                className="input-field resize-none"
                placeholder="e.g. 2x Wagyu Ribeye, 1x Royal Sunset Cocktail..."
              />
            </div>

            <div>
              <label className="block text-sm text-cream/70 mb-2">Additional Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Delivery address, timing, allergies..."
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
              {loading ? 'Submitting...' : 'Submit Inquiry'}
              <Send className="w-5 h-5" />
            </button>
          </form>

          <div className="order-1 lg:order-2">
            <p className="text-sunset uppercase tracking-[0.3em] text-sm font-medium mb-4">
              Order Inquiry
            </p>
            <h2 className="section-title mb-6">Place Your Order</h2>
            <p className="text-cream/60 mb-8 leading-relaxed">
              Planning a special meal? Submit your order inquiry and our concierge team will
              prepare everything to perfection.
            </p>

            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-sunset to-gold">
                  <ShoppingBag className="w-6 h-6 text-navy" />
                </div>
                <div>
                  <p className="text-cream font-medium">Flexible Options</p>
                  <p className="text-cream/50 text-sm">Dine-in, takeaway, delivery & catering</p>
                </div>
              </div>
              <p className="text-cream/60 text-sm leading-relaxed border-t border-white/10 pt-4">
                For urgent orders, use our WhatsApp button or chatbot for instant assistance.
                Average response time: under 30 minutes during service hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
