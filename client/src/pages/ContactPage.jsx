import { useEffect } from 'react';
import InquiryForm from '../components/InquiryForm';
import Footer from '../components/Footer';

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-navy text-cream pt-20">
      <InquiryForm />
      <Footer />
    </div>
  );
}
