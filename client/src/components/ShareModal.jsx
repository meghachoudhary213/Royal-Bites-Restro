import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { showSuccess } from '../utils/toast';

export default function ShareModal({ isOpen, onClose, title, text, url }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url || 'https://royal-bites-restro.onrender.com');
  const encodedText = encodeURIComponent(text || 'Experience premium dining at Royal Bites 🍽️');
  const fullWhatsAppText = encodeURIComponent(`${text || 'Experience premium dining at Royal Bites 🍽️'}\n${url || 'https://royal-bites-restro.onrender.com'}`);

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.489 0 9.952-4.466 9.955-9.959.002-2.661-1.025-5.163-2.89-7.03C16.571 1.747 14.072.72 11.4 0.72c-5.49 0-9.953 4.467-9.957 9.96-.001 1.986.518 3.926 1.508 5.642L1.87 20.27l4.777-1.116zM17.8 14.522c-.34-.17-2.01-.992-2.32-1.105-.312-.113-.54-.17-.766.17-.226.341-.877 1.104-1.076 1.332-.198.226-.397.255-.737.085-.34-.17-1.436-.53-2.736-1.69-1.012-.903-1.694-2.02-1.892-2.36-.198-.341-.021-.525.149-.694.153-.152.34-.397.51-.595.17-.198.226-.34.34-.567.113-.227.056-.425-.028-.595-.085-.17-.766-1.844-1.05-2.527-.276-.665-.553-.575-.765-.586l-.652-.007c-.227 0-.595.085-.907.425-.312.34-1.19 1.163-1.19 2.834 0 1.671 1.218 3.284 1.388 3.51.17.227 2.398 3.662 5.808 5.132.81.35 1.442.559 1.933.715.814.26 1.556.223 2.143.135.654-.099 2.01-.822 2.293-1.583.283-.76.283-1.413.198-1.554-.084-.141-.311-.226-.65-.396z"/>
        </svg>
      ),
      url: `https://wa.me/?text=${fullWhatsAppText}`,
      bgClass: 'hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366]/40',
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      bgClass: 'hover:bg-white/20 hover:text-white hover:border-white/40',
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bgClass: 'hover:bg-[#1877F2]/20 hover:text-[#1877F2] hover:border-[#1877F2]/40',
    },
    {
      name: 'Telegram',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0C5.344 0 0 5.344 0 11.944c0 6.6 5.344 11.944 11.944 11.944 6.6 0 11.944-5.344 11.944-11.944C23.888 5.344 18.544 0 11.944 0zm5.83 8.083l-2.005 9.444c-.15.674-.551.838-1.114.523l-3.054-2.25-1.473 1.417c-.163.163-.3.3-.614.3l.219-3.111 5.666-5.122c.246-.219-.054-.341-.381-.123l-7.002 4.409-3.021-.944c-.657-.206-.671-.657.137-.974l11.804-4.549c.547-.206 1.025.123.838.974z"/>
        </svg>
      ),
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      bgClass: 'hover:bg-[#0088cc]/20 hover:text-[#0088cc] hover:border-[#0088cc]/40',
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showSuccess("Link copied successfully!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy-dark/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md glass-strong border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-enter z-10">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-sunset/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gold/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6 relative">
          <div>
            <h3 className="font-display text-2xl font-bold text-gradient">Share Menu</h3>
            <p className="text-xs text-cream/50 mt-1">Spread the taste of Royal Bites</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-cream/70 hover:text-sunset hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shared URL Preview */}
        <div className="mb-6 p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-sm text-cream/70">
          <span className="truncate text-xs font-mono select-all flex-1 pr-2">
            {url}
          </span>
          <button
            onClick={handleCopyLink}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
              copied
                ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                : 'bg-gradient-to-r from-sunset to-gold text-navy hover:opacity-90 active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 animate-bounce" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Quick Social Shares */}
        <div className="grid grid-cols-2 gap-3 relative">
          {shareOptions.map((opt) => (
            <a
              key={opt.name}
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-cream/80 text-sm font-semibold transition-all duration-300 cursor-pointer ${opt.bgClass}`}
            >
              <span className="shrink-0">{opt.icon}</span>
              <span>{opt.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
