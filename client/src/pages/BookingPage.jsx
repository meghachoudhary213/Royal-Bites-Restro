import { useEffect } from 'react';
import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';

export default function BookingPage() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-navy text-cream pt-20">
      <BookingForm />
      <Footer />
    </div>
  );
}
