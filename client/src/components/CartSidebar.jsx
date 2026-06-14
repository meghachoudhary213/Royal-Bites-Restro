import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import { restaurantInfo } from '../data/menu';

const VegIndicator = ({ isVeg }) => (
  <span 
    className={`inline-flex items-center justify-center w-3.5 h-3.5 border-2 rounded shrink-0 bg-white/5 ${
      isVeg ? 'border-green-600 bg-green-600/5' : 'border-red-600 bg-red-600/5'
    }`}
    title={isVeg ? 'Veg' : 'Non-Veg'}
  >
    {isVeg ? (
      <span className="w-1 h-1 rounded-full bg-green-600" />
    ) : (
      <svg className="w-1.5 h-1.5 fill-red-600" viewBox="0 0 100 100">
        <polygon points="50,15 90,85 10,85" />
      </svg>
    )}
  </span>
);

export default function CartSidebar({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveFromCart, onCheckout }) {
  // Prevent background scrolling when cart sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    onCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-navy-dark/70 backdrop-blur-sm transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        {/* Sidebar Panel */}
        <div className="w-screen max-w-md glass-strong border-l border-white/20 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-navy/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-sunset to-gold">
                <ShoppingBag className="w-5 h-5 text-navy" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-cream">Your Cart</h2>
                <p className="text-xs text-cream/50">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-sunset text-cream hover:text-navy transition-all duration-300"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar bg-navy/20">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div 
                  key={item.name}
                  className="glass-card p-4 flex gap-4 border border-white/10 hover:border-white/20 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-1.5 pt-0.5">
                          <VegIndicator isVeg={item.isVeg !== false} />
                          <h4 className="font-display text-base font-semibold text-cream leading-tight">
                            {item.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => onRemoveFromCart(item.name)}
                          className="text-cream/30 hover:text-pink transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs text-gold font-bold block mt-1">₹{item.price}</span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-navy/80 border border-white/10 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.name, item.quantity - 1)}
                          className="p-1 rounded-lg hover:bg-white/10 text-cream/70 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-semibold text-cream px-2 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.name, item.quantity + 1)}
                          className="p-1 rounded-lg hover:bg-white/10 text-cream/70 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <span className="text-sm font-semibold text-cream">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="p-4 rounded-3xl bg-white/5 mb-4 border border-white/5 text-cream/30">
                  <ShoppingBag className="w-12 h-12" />
                </div>
                <h3 className="font-display text-lg text-cream/80 font-bold mb-1">Your cart is empty</h3>
                <p className="text-cream/50 text-sm max-w-xs mb-6">
                  Add delicious dishes from our signature menu to start your order.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-sunset to-gold text-navy font-semibold text-xs transition-all hover:scale-105 active:scale-95"
                >
                  Browse Menu
                </button>
              </div>
            )}
          </div>

          {/* Checkout Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-navy/85 border-t border-white/10 space-y-3">
              <div className="space-y-1.5 text-xs text-cream/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-cream">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-cream">₹{(totalAmount * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-cream">
                    {totalAmount >= 500 ? (
                      <span className="text-green-400">FREE</span>
                    ) : (
                      `₹40.00`
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 my-2" />

              <div className="flex items-center justify-between text-cream mb-2">
                <span className="text-sm font-medium opacity-65">Grand Total</span>
                <span className="font-display text-2xl font-bold text-gradient">
                  ₹{(totalAmount + (totalAmount * 0.05) + (totalAmount >= 500 ? 0 : 40)).toFixed(2)}
                </span>
              </div>
              
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-semibold bg-gradient-to-r from-sunset to-gold-dark text-navy hover:shadow-lg hover:shadow-sunset/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
