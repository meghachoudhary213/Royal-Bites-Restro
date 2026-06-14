import { Gift, Percent, Utensils, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const offers = [
  {
    code: 'ROYAL20',
    title: 'Flat 20% Off',
    subtitle: 'On your first table booking',
    description: 'Reserve a table online and enjoy a flat 20% discount on your dine-in experience.',
    icon: Percent,
    color: 'from-sunset to-sunset-dark',
  },
  {
    code: 'FAMILY799',
    title: 'Family Combo at ₹799',
    subtitle: 'Complete meal for your loved ones',
    description: 'Includes 1 Starter, 2 North Indian Main Course dishes, 4 Butter Naans, and Lassis.',
    icon: Utensils,
    color: 'from-gold to-gold-dark',
  },
  {
    code: 'FREEGIFT',
    title: 'Free Dessert',
    subtitle: 'On orders above ₹999',
    description: 'Get a complimentary Rasmalai or Gulab Jamun on your online delivery or dine-in orders.',
    icon: Gift,
    color: 'from-pink to-pink-soft',
  },
];

export default function OffersSection() {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  return (
    <section id="offers" className="relative py-20 bg-navy">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark via-navy/50 to-navy pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sunset uppercase tracking-[0.3em] text-sm font-medium mb-3">
            Exclusive Deals
          </p>
          <h2 className="section-title">Offers & Dining Deals</h2>
          <p className="text-cream/60 mt-2 max-w-xl mx-auto">
            Take advantage of these special savings designed to make your royal feast even sweeter.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {offers.map((offer) => {
            const Icon = offer.icon;
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer.code}
                className="glass-card group p-6 relative overflow-hidden flex flex-col justify-between hover:border-sunset/40 transition-all duration-500 hover:-translate-y-1"
              >
                {/* Glowing light effect behind icon */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-sunset/10 transition-colors" />

                <div>
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${offer.color} text-navy mb-6`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-display text-xl text-cream mb-1">{offer.title}</h3>
                  <p className="text-gold text-sm font-medium mb-3">{offer.subtitle}</p>
                  <p className="text-cream/60 text-xs leading-relaxed mb-6">
                    {offer.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="bg-navy/80 border border-white/10 px-3 py-1.5 rounded-xl">
                    <span className="text-xs text-cream/40 mr-2 font-mono">CODE:</span>
                    <span className="text-sm text-gradient font-bold font-mono tracking-wider">
                      {offer.code}
                    </span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(offer.code)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-cream/70 hover:text-cream transition-all duration-300 flex items-center gap-1 text-xs"
                    aria-label="Copy discount code"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
