import { useState, useEffect } from 'react';
import { hotelOffers } from '../data/hotel';
import { Calendar, Clipboard, Check } from 'lucide-react';
import { showSuccess } from '../utils/toast';
import Footer from '../components/Footer';

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showSuccess(`Promo code ${code} copied to clipboard!`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

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
          <p className="text-sunset uppercase tracking-[0.25em] text-xs font-semibold mb-3">Special Exclusives</p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-gradient mb-6">Resort Packages & Offers</h1>
          <p className="text-cream/70 text-sm sm:text-base leading-relaxed">
            Enhance your luxury getaway. Benefit from our exclusive stay privileges, dining credits, and wellness specials. Use our promo codes during reservation or checkout to activate.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {hotelOffers.map((offer) => {
            const isCopied = copiedCode === offer.code;
            return (
              <div 
                key={offer.code} 
                className="glass-strong rounded-3xl overflow-hidden border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300 relative group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-sunset/20 text-sunset text-[10px] sm:text-xs font-bold uppercase rounded-lg tracking-wider">
                      {offer.discount}
                    </span>
                    <span className="text-[10px] text-cream/50 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {offer.validity}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-cream group-hover:text-gold transition-colors">{offer.title}</h3>
                  <p className="text-cream/60 text-xs sm:text-sm leading-relaxed">{offer.description}</p>
                </div>

                {/* Promo Code Card */}
                <div className="mt-8 pt-4 border-t border-white/5">
                  <p className="text-[10px] text-cream/40 uppercase tracking-widest mb-2 font-mono">Promo Code</p>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-navy/60 border border-white/5">
                    <span className="font-mono font-bold text-gold text-sm tracking-wider">{offer.code}</span>
                    <button
                      onClick={() => handleCopy(offer.code)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-cream/70 hover:text-cream cursor-pointer transition-colors border-0 flex items-center gap-1.5 text-xs font-semibold"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
