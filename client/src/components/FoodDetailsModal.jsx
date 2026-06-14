import { X, Star, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import { restaurantInfo } from '../data/menu';

const VegIndicator = ({ isVeg }) => (
  <span 
    className={`inline-flex items-center justify-center w-4 h-4 border-2 rounded shrink-0 bg-white/5 ${
      isVeg ? 'border-green-600 bg-green-600/5' : 'border-red-600 bg-red-600/5'
    }`}
    title={isVeg ? 'Veg' : 'Non-Veg'}
  >
    {isVeg ? (
      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
    ) : (
      <svg className="w-2 h-2 fill-red-600" viewBox="0 0 100 100">
        <polygon points="50,15 90,85 10,85" />
      </svg>
    )}
  </span>
);

export default function FoodDetailsModal({ item, onClose, onAddToCart }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [item]);

  if (!item) return null;

  const handleWhatsAppOrder = () => {
    const message = `Hi Royal Bites, I would like to order "${item.name}" (Price: ₹${item.price}). Please confirm my order!`;
    const encoded = encodeURIComponent(message);
    const whatsappNum = restaurantInfo.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${whatsappNum}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-navy-dark/80 backdrop-blur-md transition-opacity duration-300" 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl glass-strong rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-white/20">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-navy/80 border border-white/10 hover:bg-sunset text-cream hover:text-navy transition-all duration-300"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Header Image */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/35 to-transparent" />
            
            {/* Tag Badge */}
            {item.tag && (
              <span className="absolute bottom-4 left-6 px-3.5 py-1.5 rounded-full bg-sunset/90 text-navy text-xs font-bold uppercase tracking-wider">
                {item.tag}
              </span>
            )}
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-start gap-2.5 pt-1 mb-2">
                  <VegIndicator isVeg={item.isVeg !== false} />
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream leading-tight">
                    {item.name}
                  </h3>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(item.rating || 4.5)
                            ? 'fill-gold text-gold'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gold">
                    {item.rating || '4.5'}
                  </span>
                  <span className="text-xs text-cream/40">• (50+ Ratings)</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-gradient font-display text-3xl font-bold">
                ₹{item.price}
              </div>
            </div>

            <p className="text-cream/70 text-sm sm:text-base leading-relaxed mb-6">
              {item.description}
            </p>

            {item.available === false ? (
              <div className="p-4 rounded-2xl glass-card border border-red-500/20 bg-red-500/5 mb-8 flex gap-4 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <div className="text-xs text-cream/80">
                  <span className="font-bold text-red-400">Temporarily Unavailable:</span> This dish is currently out of stock. Our chefs are working to restock ingredients soon.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl glass-card border-white/5 mb-8 flex gap-4 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                <div className="text-xs text-cream/80">
                  <span className="font-bold text-green-400">Freshly Prepared:</span> Our kitchen prepares this dish fresh upon order confirmation. Average cooking time is 15-20 minutes.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-navy/85 border-t border-white/10 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              onAddToCart && onAddToCart(item);
              onClose();
            }}
            disabled={item.available === false}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 border active:scale-98 ${
              item.available === false
                ? 'bg-white/5 border-white/5 text-cream/30 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 text-cream border-white/10'
            }`}
          >
            <ShoppingBag className={`w-5 h-5 ${item.available === false ? 'text-cream/20' : 'text-gold'}`} />
            {item.available === false ? 'Out of Stock' : 'Add to Cart'}
          </button>
          
          <button
            type="button"
            onClick={handleWhatsAppOrder}
            disabled={item.available === false}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold active:scale-98 transition-all duration-300 ${
              item.available === false
                ? 'bg-white/5 border border-white/5 text-cream/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-sunset to-gold-dark text-navy hover:shadow-lg hover:shadow-sunset/30 hover:-translate-y-0.5'
            }`}
          >
            {item.available !== false && (
              <svg 
                className="w-5 h-5 fill-current" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 2.002 14.12 1.01 11.5 1.017c-5.45.004-9.873 4.38-9.877 9.809-.001 1.77.476 3.497 1.382 5.01L1.93 20.453l4.717-1.3zm12.385-6.046c-.302-.151-1.787-.882-2.062-.982-.275-.1-.475-.151-.675.15-.2.301-.775.979-.95 1.179-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.795-1.49-1.77-1.665-2.07-.175-.3-.018-.462.13-.61.135-.133.303-.35.454-.525.152-.175.202-.3.303-.5.101-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52-.172-.007-.37-.01-.57-.01-.2 0-.526.075-.801.374-.275.3-1.05 1.027-1.05 2.505 0 1.477 1.075 2.903 1.225 3.102.15.2 2.115 3.227 5.125 4.525.715.309 1.275.494 1.71.633.72.229 1.375.196 1.89.12.574-.085 1.787-.73 2.037-1.43.25-.7.25-1.3.175-1.43-.075-.1-.275-.201-.575-.351z"/>
              </svg>
            )}
            {item.available === false ? 'Unavailable' : 'Order on WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
}
