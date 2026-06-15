import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Hero from '../components/Hero';
import CuisineExplorer from '../components/CuisineExplorer';
import OffersSection from '../components/OffersSection';
import PopularNearYou from '../components/PopularNearYou';
import ReviewsSection from '../components/ReviewsSection';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import WhatsAppButton, { openWhatsApp } from '../components/WhatsAppButton';
import { api } from '../api/api';
import { Calendar, ArrowRight } from 'lucide-react';

export default function Home({
  onAddToCart,
  onItemClick,
  onSelectCategory,
  currentUser,
  onToggleFavourite,
  menuCategories,
}) {
  const [whatsappNumber, setWhatsappNumber] = useState(import.meta.env.VITE_WHATSAPP_NUMBER || '9691832020');
  const location = useLocation();

  useEffect(() => {
    api.health()
      .then((res) => {
        if (res.whatsapp) setWhatsappNumber(res.whatsapp);
      })
      .catch(() => {});
  }, []);

  // Smooth scroll to hash elements when landing on the home page
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <>
      <Hero />
      <CuisineExplorer onSelectCategory={onSelectCategory} />
      <PopularNearYou 
        onItemClick={onItemClick} 
        onAddToCart={onAddToCart} 
        currentUser={currentUser} 
        onToggleFavourite={onToggleFavourite} 
        menuCategories={menuCategories}
      />
      <OffersSection />
      <ReviewsSection />
      
      {/* Elegant Reservation Call-To-Action */}
      <section className="relative py-24 bg-navy-dark overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-navy to-navy-dark pointer-events-none" />
        <div className="absolute inset-0 sunset-gradient opacity-10 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gold mb-6">
            <Calendar className="w-4 h-4 text-sunset" />
            <span>Table Reservations</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Reserve Your Sunset Experience
          </h2>
          <p className="text-cream/70 max-w-2xl mx-auto mb-10 leading-relaxed text-sm sm:text-base">
            Secure your table to enjoy exquisite recipes handpicked by our culinary experts. 
            Indulge in royal dining inside our luxury gold-accented lounges.
          </p>
          <Link
            to="/booking"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-sunset to-gold text-navy hover:shadow-lg hover:shadow-sunset/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            Book A Table
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton number={whatsappNumber} />
      <Chatbot onWhatsApp={() => openWhatsApp(whatsappNumber)} />
    </>
  );
}
