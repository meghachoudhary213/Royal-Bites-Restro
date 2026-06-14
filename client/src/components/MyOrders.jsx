import { X, History, ShoppingBag, Clock, Truck, CheckCircle, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';

export default function MyOrders({ isOpen, onClose, currentUser, onReorder }) {
  // Prevent background scrolling when modal is open
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

  if (!isOpen || !currentUser) return null;

  // Retrieve user orders (fallback to empty list if none exist)
  const orders = currentUser.orders || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Preparing':
        return <Clock className="w-4 h-4 text-gold" />;
      case 'Out for Delivery':
        return <Truck className="w-4 h-4 text-sunset" />;
      case 'Delivered':
      default:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Preparing':
        return 'bg-gold/15 text-gold border-gold/30';
      case 'Out for Delivery':
        return 'bg-sunset/15 text-sunset border-sunset/30';
      case 'Delivered':
      default:
        return 'bg-green-500/15 text-green-400 border-green-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-navy-dark/80 backdrop-blur-md transition-opacity duration-300" 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg glass-strong rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[85vh]">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-navy/80 border border-white/10 hover:bg-sunset text-cream hover:text-navy transition-all duration-300"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-sunset/20 to-gold/10 p-6 border-b border-white/10 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sunset to-gold text-navy">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-cream">Order History</h3>
            <p className="text-xs text-cream/50">Track and view your past royal feasts</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto no-scrollbar flex-1 space-y-4 bg-navy/20">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div 
                key={order.id}
                className="glass-card p-5 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-4"
              >
                {/* ID & Date & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                  <div>
                    <span className="text-xs font-mono text-cream/40 block">ORDER ID</span>
                    <span className="text-sm font-bold text-cream font-mono">{order.id}</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs text-cream/40 block">DATE</span>
                    <span className="text-xs text-cream/80 font-medium">{order.date}</span>
                  </div>
                  <div className={`self-start sm:self-center px-3 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-2 py-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-cream/80 font-medium">
                        {item.name} <span className="text-cream/40 ml-1">x{item.quantity}</span>
                      </span>
                      <span className="text-cream/60">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Total & Reorder Button */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-1">
                  <div>
                    <span className="text-xs text-cream/40 block">TOTAL PAID</span>
                    <span className="text-base font-bold text-gold">₹{order.total}</span>
                    <span className="text-[10px] text-cream/35 block">via {order.paymentMethod}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onReorder(order.items);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-sunset text-cream hover:text-navy transition-all duration-300 border border-white/10 active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reorder Items
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-6">
              <div className="p-4 rounded-3xl bg-white/5 mb-4 border border-white/5 text-cream/30">
                <ShoppingBag className="w-12 h-12" />
              </div>
              <h3 className="font-display text-lg text-cream/80 font-bold mb-1">No Orders Yet</h3>
              <p className="text-cream/50 text-sm max-w-xs">
                Your order log is currently empty. Once you order delicious food, it will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
