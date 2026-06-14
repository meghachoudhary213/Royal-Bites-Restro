import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquare } from 'lucide-react';
import { api } from '../api/api';

const defaultReviews = [
  {
    id: 'REV-1',
    orderId: 'RB-9821',
    customerName: 'Rohan Sharma',
    customerEmail: 'rohan@example.com',
    rating: 5,
    comment: 'The Butter Naan was incredibly soft and the Paneer Tikka was cooked to perfection. Absolutely loved the sunset packaging and premium taste!',
    date: '2026-06-08',
    items: ['Paneer Tikka', 'Butter Naan'],
    featured: true,
    status: 'approved'
  },
  {
    id: 'REV-2',
    orderId: 'RB-1024',
    customerName: 'Priya Patel',
    customerEmail: 'priya@example.com',
    rating: 5,
    comment: 'Royal Bites never disappoints. The Biryani has such a rich, authentic flavor. Prompt delivery and hot food. A complete 5-star experience!',
    date: '2026-06-09',
    items: ['Shahi Biryani'],
    featured: true,
    status: 'approved'
  },
  {
    id: 'REV-3',
    orderId: 'RB-1087',
    customerName: 'Ananya Verma',
    customerEmail: 'ananya@example.com',
    rating: 4,
    comment: 'Delicious Dal Makhani and great mocktails. The luxury glassmorphic vibe of the restaurant is matched by the premium quality of their food.',
    date: '2026-06-10',
    items: ['Dal Makhani', 'Sunset Mocktail'],
    featured: true,
    status: 'approved'
  }
];

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.getReviews();
        if (res.success && res.data && res.data.length > 0) {
          setReviews(res.data);
          // Sync to localStorage
          localStorage.setItem('rb_reviews', JSON.stringify(res.data));
        } else {
          loadLocalReviews();
        }
      } catch (err) {
        console.warn('Failed to fetch reviews from MongoDB, falling back to localStorage:', err.message);
        loadLocalReviews();
      }
    };

    const loadLocalReviews = () => {
      const stored = localStorage.getItem('rb_reviews');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.length > 0) {
            setReviews(parsed);
          } else {
            localStorage.setItem('rb_reviews', JSON.stringify(defaultReviews));
            setReviews(defaultReviews);
          }
        } catch (e) {
          setReviews(defaultReviews);
        }
      } else {
        localStorage.setItem('rb_reviews', JSON.stringify(defaultReviews));
        setReviews(defaultReviews);
      }
    };

    fetchReviews();
  }, []);

  // Filter approved reviews only
  const approvedReviews = reviews.filter(
    (r) => r.status === 'approved' || r.status === undefined
  );
  
  // Featured reviews for the carousel
  const featuredReviews = approvedReviews.filter((r) => r.featured);
  
  // Calculate average and total count
  const totalReviewsCount = approvedReviews.length;
  const avgRating = totalReviewsCount > 0 
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : '5.0';

  const nextSlide = () => {
    if (featuredReviews.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % featuredReviews.length);
  };

  const prevSlide = () => {
    if (featuredReviews.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + featuredReviews.length) % featuredReviews.length);
  };

  // Auto play
  useEffect(() => {
    if (featuredReviews.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [featuredReviews.length]);

  return (
    <section id="reviews" className="relative py-24 bg-navy overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark to-navy pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sunset/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-gold mb-4">
              <MessageSquare className="w-3.5 h-3.5 text-sunset" />
              <span>Patron Testimonials</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient">
              The Gastronomic Chronicles
            </h2>
            <p className="text-cream/50 mt-2 text-sm max-w-xl">
              Discover why food connoisseurs and families choose Royal Bites for their dining experiences.
            </p>
          </div>

          {/* Aggregated Score Panel */}
          <div className="glass p-5 rounded-2xl border border-white/10 flex items-center gap-5 shrink-0 self-start md:self-end">
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-bold font-display text-gold flex items-center gap-1">
                {avgRating}
                <Star className="w-6 h-6 text-gold fill-gold shrink-0" />
              </span>
              <span className="text-[10px] text-cream/40 block mt-1 uppercase tracking-wider font-semibold">Average Rating</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <span className="text-2xl font-bold font-display text-cream block">{totalReviewsCount}</span>
              <span className="text-[10px] text-cream/40 block mt-0.5 uppercase tracking-wider font-semibold">Verified Reviews</span>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        {featuredReviews.length > 0 ? (
          <div className="relative max-w-3xl mx-auto">
            
            {/* Carousel Track */}
            <div className="overflow-hidden min-h-[250px] flex items-center">
              {featuredReviews.map((rev, idx) => (
                <div
                  key={rev.id}
                  className={`w-full transition-all duration-500 ease-in-out transform flex flex-col items-center text-center ${
                    idx === activeIndex
                      ? 'opacity-100 scale-100 relative'
                      : 'opacity-0 scale-95 absolute pointer-events-none'
                  }`}
                >
                  <Quote className="w-12 h-12 text-sunset/15 mb-6" />
                  
                  {/* Rating stars */}
                  <div className="flex gap-1.5 mb-4">
                    {Array.from({ length: 5 }).map((_, sIdx) => (
                      <Star
                        key={sIdx}
                        className={`w-4 h-4 ${
                          sIdx < rev.rating ? 'text-gold fill-gold' : 'text-white/10'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-cream/90 text-base sm:text-lg md:text-xl font-medium leading-relaxed italic max-w-2xl px-4 mb-6">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Customer details */}
                  <div>
                    <h4 className="font-display text-gold font-bold text-sm tracking-wider uppercase">
                      {rev.customerName}
                    </h4>
                    <span className="text-[10px] text-cream/40 block mt-1">
                      Verified Diner • {rev.date}
                    </span>
                    {rev.items && rev.items.length > 0 && (
                      <span className="inline-block bg-white/5 border border-white/5 text-[9px] text-cream/60 px-2.5 py-0.5 rounded-full mt-2">
                        Feasted on: {rev.items.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            {featuredReviews.length > 1 && (
              <div className="flex justify-center items-center gap-6 mt-10">
                <button
                  onClick={prevSlide}
                  className="p-2.5 rounded-xl border border-white/10 glass hover:bg-white/15 text-cream hover:text-gold transition-all duration-300 cursor-pointer"
                  aria-label="Previous Review"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Dots indicator */}
                <div className="flex gap-2">
                  {featuredReviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer border-0 ${
                        idx === activeIndex
                          ? 'w-6 bg-gradient-to-r from-sunset to-gold'
                          : 'bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="p-2.5 rounded-xl border border-white/10 glass hover:bg-white/15 text-cream hover:text-gold transition-all duration-300 cursor-pointer"
                  aria-label="Next Review"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 glass rounded-3xl p-6 text-cream/40">
            <Quote className="w-12 h-12 mx-auto text-cream/10 mb-4" />
            <p className="text-sm">We are gathering experiences from our royal patrons.</p>
          </div>
        )}

      </div>
    </section>
  );
}
