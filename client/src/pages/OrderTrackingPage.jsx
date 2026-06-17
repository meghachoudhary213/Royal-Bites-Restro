import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Clock, ShoppingBag, Utensils, Package, Truck, CheckCircle2, 
  AlertCircle, Phone, Info
} from 'lucide-react';
import { getWhatsAppLink } from '../utils/whatsappLink';

const STAGES = [
  { status: 'Order Received', label: 'Order Placed', desc: 'We have received your royal feast request', icon: ShoppingBag },
  { status: 'Preparing', label: 'Preparing', desc: 'Our chefs are cooking your dishes with care', icon: Utensils },
  { status: 'Ready', label: 'Ready', desc: 'Feast is packed and ready for dispatch', icon: Package },
  { status: 'Out For Delivery', label: 'Out For Delivery', desc: 'Our royal courier is on their way', icon: Truck },
  { status: 'Delivered', label: 'Delivered', desc: 'Feast delivered! Enjoy your meal', icon: CheckCircle2 }
];

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  const fetchOrder = () => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('rb_all_orders') || '[]');
      const foundOrder = allOrders.find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // Check in user's profile order list as fallback
        const session = localStorage.getItem('currentUser');
        if (session) {
          const currentUser = JSON.parse(session);
          if (currentUser && currentUser.orders) {
            const found = currentUser.orders.find(o => o.id === orderId);
            if (found) setOrder(found);
          }
        }
      }
    } catch (e) {
      console.error('Error parsing order data from localStorage:', e);
    }
  };

  useEffect(() => {
    // Defer state update to next tick to avoid synchronous setState inside effect warnings
    setTimeout(fetchOrder, 0);

    // Listen for storage events (updates from admin dashboard)
    const handleStorageChange = () => {
      fetchOrder();
    };

    window.addEventListener('storage', handleStorageChange);
    // Also use interval polling to capture same-window updates instantly
    const interval = setInterval(fetchOrder, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-4">
        <div className="glass-strong rounded-3xl p-8 max-w-md text-center border border-white/20">
          <AlertCircle className="w-12 h-12 text-sunset mx-auto mb-4 animate-pulse" />
          <h2 className="font-display text-xl font-bold text-cream mb-2">Order Not Found</h2>
          <p className="text-xs text-cream/60 mb-6">We couldn't retrieve the details for order {orderId}.</p>
          <Link to="/menu" className="btn-primary py-2 px-6 text-xs rounded-xl">
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  // Find the current stage index based on order status
  const currentStageIndex = STAGES.findIndex(s => s.status.toLowerCase() === order.status.toLowerCase());

  return (
    <div className="min-h-screen bg-navy text-cream pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/dashboard?tab=orders" className="inline-flex items-center gap-2 text-xs text-cream/60 hover:text-gold transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {/* Header Summary Card */}
        <div className="glass p-6 rounded-3xl border border-white/10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-cream/40 uppercase tracking-widest font-mono">ORDER ID</span>
              <span className="text-sm font-mono font-bold text-gold">{order.id}</span>
            </div>
            <h1 className="font-display text-2xl font-bold mt-1">Tracking Your Feast</h1>
            <p className="text-xs text-cream/50 mt-1">Status: <span className="text-sunset font-semibold">{order.status}</span> · Placed on {order.date}</p>
          </div>

          <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl shrink-0">
            <Clock className="w-6 h-6 text-sunset animate-pulse" />
            <div>
              <span className="text-[9px] text-cream/40 block uppercase tracking-wider">Estimated Time</span>
              <span className="text-sm font-bold text-cream">{order.estimatedTime || '35 - 45 mins'}</span>
            </div>
          </div>
        </div>

        {/* Visual Timeline (Vertical on small screens, detailed on all) */}
        {order.status === 'Cancelled' ? (
          <div className="glass-strong p-8 rounded-3xl border border-red-500/35 bg-red-500/5 text-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/45 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-red-300">Order Cancelled</h3>
              <p className="text-xs text-cream/60 max-w-md mx-auto mt-2 leading-relaxed">
                This order has been cancelled. If this is unexpected, please contact our support team immediately to resolve any issues or to place a new order.
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-strong p-6 sm:p-8 rounded-3xl border border-white/20 mb-8 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5">
              Visual Delivery Timeline
            </h3>

            <div className="relative pl-8 sm:pl-0 sm:flex sm:justify-between sm:items-start space-y-8 sm:space-y-0 sm:gap-4 pt-4">
              
              {/* Horizontal Line background (Desktop only) */}
              <div className="hidden sm:block absolute top-10 left-10 right-10 h-1 bg-white/10 z-0" />
              
              {/* Active Highlight Line background (Desktop only) */}
              {currentStageIndex > 0 && (
                <div 
                  className="hidden sm:block absolute top-10 left-10 h-1 bg-gradient-to-r from-sunset to-gold z-0 transition-all duration-500" 
                  style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 80}%` }}
                />
              )}

              {/* Vertical Line background (Mobile only) */}
              <div className="sm:hidden absolute top-4 bottom-4 left-3.5 w-0.5 bg-white/10 z-0" />
              {currentStageIndex > 0 && (
                <div 
                  className="sm:hidden absolute top-4 left-3.5 w-0.5 bg-gradient-to-b from-sunset to-gold z-0 transition-all duration-500"
                  style={{ height: `${(currentStageIndex / (STAGES.length - 1)) * 90}%` }}
                />
              )}

              {STAGES.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isActive = index === currentStageIndex;
                const isPending = index > currentStageIndex;

                return (
                  <div key={index} className="relative z-10 flex sm:flex-col sm:items-center sm:text-center gap-4 sm:gap-2 sm:flex-1">
                    
                    {/* Status Circle Icon */}
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all duration-500 ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 text-navy shadow-lg shadow-green-500/20' 
                        : isActive 
                          ? 'bg-gradient-to-br from-sunset to-gold border-sunset text-navy scale-110 shadow-lg shadow-sunset/40 animate-pulse'
                          : 'bg-navy border-white/10 text-cream/35'
                    }`}>
                      <stage.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Stage Label & Details */}
                    <div className="flex-grow sm:mt-2">
                      <h4 className={`text-xs sm:text-sm font-semibold transition-colors duration-500 ${isActive ? 'text-gold' : isPending ? 'text-cream/40' : 'text-cream'}`}>
                        {stage.label}
                      </h4>
                      <p className={`text-[10px] leading-tight mt-0.5 max-w-[150px] mx-auto transition-colors duration-500 ${isActive ? 'text-cream/80' : 'text-cream/35'}`}>
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        )}

        {/* Order Details & Summary Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Summary */}
          <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              Order Items ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
            </h3>
            
            <div className="divide-y divide-white/5 space-y-1 text-xs max-h-48 overflow-y-auto no-scrollbar">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2">
                  <span className="text-cream/80">{item.name} <span className="text-cream/40">x{item.quantity}</span></span>
                  <span className="text-cream font-semibold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-3 mt-auto space-y-1.5 text-xs text-cream/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2) || (order.total - order.gst).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{order.gst?.toFixed(2) || (order.total * 0.05).toFixed(2)}</span>
              </div>
              {order.deliveryCharge > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>₹{order.deliveryCharge?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-white/5 text-sm font-bold text-cream">
                <span>Total Amount</span>
                <span className="text-gold">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Delivery Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-cream/40 block uppercase tracking-wider">Order Type</span>
                <span className="font-semibold text-cream">{order.orderType || 'Delivery'}</span>
              </div>

              <div>
                <span className="text-[10px] text-cream/40 block uppercase tracking-wider">Payment Method</span>
                <span className="font-semibold text-cream">{order.paymentMethod}</span>
              </div>

              {order.specialInstructions && order.specialInstructions !== 'None' && (
                <div>
                  <span className="text-[10px] text-cream/40 block uppercase tracking-wider">Special Instructions</span>
                  <span className="italic text-cream/80">&ldquo;{order.specialInstructions}&rdquo;</span>
                </div>
              )}

              {/* Help & Support */}
              <div className="pt-3 border-t border-white/5">
                <span className="text-[10px] text-cream/40 block uppercase tracking-wider mb-2">Need Help?</span>
                <a
                  href={getWhatsAppLink(`Hi Royal Bites, I need assistance with order ID ${order.id}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 text-green-400 rounded-xl font-semibold transition-all text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Contact Royal Support
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
