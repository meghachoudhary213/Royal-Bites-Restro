import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, MapPin, User, Phone, Mail, CreditCard, ShoppingBag, 
  CheckCircle2, Clock, Utensils, Store, Compass, Info, Check
} from 'lucide-react';
import { restaurantInfo } from '../data/menu';
import { api } from '../api/api';
import { showSuccess, showError, showWarning, showInfo, showLoading, resolveLoading } from '../utils/toast';
import { toast } from 'react-hot-toast';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  currentUser, 
  onOrderSuccess 
}) {
  const navigate = useNavigate();
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Address fields
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Order settings
  const [orderType, setOrderType] = useState('Delivery'); // Delivery, Pickup, Dine In
  const [extraSpicy, setExtraSpicy] = useState(false);
  const [lessOil, setLessOil] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // Google Pay, PhonePe, Paytm, UPI, Credit Card, Debit Card, Net Banking, COD
  
  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null); // stores the placed order details for the confirmation screen
  const [sandboxOrder, setSandboxOrder] = useState(null);

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponsList, setCouponsList] = useState([]);

  // Fetch coupons from MongoDB with local fallback
  useEffect(() => {
    const defaultCoupons = [
      { code: 'ROYAL20', discountType: 'percentage', discountValue: 20, minimumOrderAmount: 299, maximumDiscount: 100, expiryDate: '2027-12-31', usageLimit: 100, active: true, description: '20% off on orders above ₹299 (Up to ₹100)', usageCount: 0 },
      { code: 'WELCOME100', discountType: 'flat', discountValue: 100, minimumOrderAmount: 499, maximumDiscount: 100, expiryDate: '2027-12-31', usageLimit: 50, active: true, description: '₹100 flat discount on orders above ₹499', usageCount: 0 },
      { code: 'FREEGIFT', discountType: 'gift', discountValue: 0, minimumOrderAmount: 999, maximumDiscount: 0, expiryDate: '2027-12-31', usageLimit: 20, active: true, description: 'Free dessert on orders above ₹999', usageCount: 0 }
    ];

    const fetchCoupons = async () => {
      try {
        const res = await api.getCoupons();
        if (res.success && res.data && res.data.length > 0) {
          setCouponsList(res.data);
          localStorage.setItem('rb_coupons', JSON.stringify(res.data));
        } else {
          loadLocalCoupons();
        }
      } catch (err) {
        console.warn('Failed to fetch coupons from MongoDB, falling back to localStorage:', err.message);
        loadLocalCoupons();
      }
    };

    const loadLocalCoupons = () => {
      const stored = localStorage.getItem('rb_coupons');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCouponsList(parsed && parsed.length > 0 ? parsed : defaultCoupons);
        } catch (e) {
          setCouponsList(defaultCoupons);
        }
      } else {
        localStorage.setItem('rb_coupons', JSON.stringify(defaultCoupons));
        setCouponsList(defaultCoupons);
      }
    };

    if (isOpen) {
      fetchCoupons();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setAddress(currentUser.address || '');
    }
    setConfirmedOrder(null);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  }, [currentUser, isOpen]);

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

  // Order summary calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryCharge = orderType === 'Delivery' ? (subtotal >= 500 ? 0 : 40) : 0;

  // Coupon calculations
  let discountAmount = 0;
  let hasFreeGift = false;
  if (appliedCoupon) {
    const typeVal = appliedCoupon.discountType || appliedCoupon.type;
    const valueVal = appliedCoupon.discountValue !== undefined ? appliedCoupon.discountValue : appliedCoupon.value;
    const maxDiscVal = appliedCoupon.maximumDiscount !== undefined ? appliedCoupon.maximumDiscount : appliedCoupon.maxDiscount;

    if (typeVal === 'percentage') {
      let calcDiscount = Math.round(subtotal * (valueVal / 100) * 100) / 100;
      if (maxDiscVal && calcDiscount > Number(maxDiscVal)) {
        calcDiscount = Number(maxDiscVal);
      }
      discountAmount = calcDiscount;
    } else if (typeVal === 'flat') {
      discountAmount = Number(valueVal);
    } else if (typeVal === 'gift') {
      hasFreeGift = true;
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount) + gst + deliveryCharge;
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();
    
    try {
      const res = await api.validateCoupon({ couponCode: code, orderAmount: subtotal });
      if (res.valid) {
        let coupon = couponsList.find(c => c.code.toUpperCase() === code);
        if (!coupon) {
          const detailRes = await api.getCouponById(code);
          coupon = detailRes.data;
        }
        setAppliedCoupon(coupon);
        setCouponSuccess(res.message);
        showSuccess(res.message || 'Coupon applied successfully!');
        setCouponCode('');
      } else {
        setCouponError(res.message);
        showError(res.message || 'Invalid coupon.');
        setAppliedCoupon(null);
      }
    } catch (apiError) {
      console.warn('MongoDB coupon validation failed, trying localStorage fallback:', apiError.message);
      runLocalValidation(code);
    }
  };

  const runLocalValidation = (code) => {
    const storedCoupons = JSON.parse(localStorage.getItem('rb_coupons') || '[]');
    const coupon = storedCoupons.find(c => c.code.toUpperCase() === code);
    
    if (!coupon) {
      setCouponError('Invalid coupon code.');
      showError('Invalid coupon code.');
      setAppliedCoupon(null);
      return;
    }

    const isActive = coupon.active !== undefined ? coupon.active : (coupon.status === 'active');
    if (!isActive) {
      setCouponError('This coupon is currently inactive.');
      showError('This coupon is currently inactive.');
      setAppliedCoupon(null);
      return;
    }

    if (coupon.expiryDate) {
      const today = new Date().toISOString().split('T')[0];
      if (today > coupon.expiryDate) {
        setCouponError('This coupon has expired.');
        showError('This coupon has expired.');
        setAppliedCoupon(null);
        return;
      }
    }

    const limit = Number(coupon.usageLimit) || 50;
    const usages = JSON.parse(localStorage.getItem('rb_coupon_usage') || '{}');
    const currentUsageCount = Number(coupon.usageCount) || usages[coupon.code] || 0;
    if (currentUsageCount >= limit) {
      setCouponError('This coupon usage limit has been exceeded.');
      showError('This coupon usage limit has been exceeded.');
      setAppliedCoupon(null);
      return;
    }
    
    const minAmount = coupon.minimumOrderAmount !== undefined ? coupon.minimumOrderAmount : coupon.minSpend;
    if (subtotal < minAmount) {
      setCouponError(`Min. spend of ₹${minAmount} required.`);
      showError(`Min. spend of ₹${minAmount} required.`);
      setAppliedCoupon(null);
      return;
    }
    
    setAppliedCoupon(coupon);
    setCouponSuccess(`Coupon "${coupon.code}" applied!`);
    showSuccess(`Coupon "${coupon.code}" applied!`);
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  };

  const finalizeOrder = async (orderId, estTime, instructionsText, paymentDetails = {}) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const newOrder = {
      id: orderId,
      date: currentDate,
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      discount: discountAmount,
      coupon: appliedCoupon ? appliedCoupon.code : 'None',
      hasGift: hasFreeGift,
      gst,
      deliveryCharge,
      total: grandTotal,
      orderType,
      paymentMethod,
      specialInstructions: instructionsText,
      estimatedTime: estTime,
      status: 'Order Received',
      ...paymentDetails
    };

    // Step 1: Try database order submission via API (only if not already saved via verification)
    if (!paymentDetails.razorpayPaymentId) {
      try {
        const res = await api.createOrder(newOrder);
        if (res.success) {
          console.log('Order successfully saved in MongoDB');
        }
      } catch (apiError) {
        console.warn('MongoDB order saving failed, using localStorage fallback:', apiError.message);
      }
    }

    // Step 2: Fallback to localStorage logic
    // Save order to User's orders history in local storage
    const updatedUser = {
      ...currentUser,
      orders: [newOrder, ...(currentUser.orders || [])]
    };

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = users.map((u) => 
      u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u
    );

    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // If a coupon was applied, increment its usage in local storage and MongoDB
    if (appliedCoupon) {
      try {
        const currentUsages = Number(appliedCoupon.usageCount) || 0;
        await api.updateCoupon(appliedCoupon._id || appliedCoupon.code, { 
          usageCount: currentUsages + 1 
        });
        console.log('Coupon usage count successfully incremented in MongoDB');
      } catch (apiError) {
        console.warn('Failed to increment coupon usage in MongoDB, using localStorage fallback:', apiError.message);
      }

      const usages = JSON.parse(localStorage.getItem('rb_coupon_usage') || '{}');
      usages[appliedCoupon.code] = (usages[appliedCoupon.code] || 0) + 1;
      localStorage.setItem('rb_coupon_usage', JSON.stringify(usages));
    }

    // Save globally to mock restaurant dashboard
    const allOrders = JSON.parse(localStorage.getItem('rb_all_orders') || '[]');
    localStorage.setItem('rb_all_orders', JSON.stringify([newOrder, ...allOrders]));

    // Construct WhatsApp message receipt
    let message = `👑 *Royal Bites Order Confirmation* 👑\n\n`;
    message += `*Order ID:* ${orderId}\n`;
    message += `*Customer Name:* ${name}\n`;
    message += `*Phone:* ${phone}\n`;
    if (orderType === 'Delivery') {
      message += `*Address:* ${address}\n`;
      if (landmark.trim()) message += `*Landmark:* ${landmark}\n`;
      message += `*City:* ${city} - ${pincode}\n`;
    }
    message += `*Order Type:* ${orderType}\n`;
    if (appliedCoupon) {
      message += `*Coupon Code:* ${appliedCoupon.code} (${appliedCoupon.description || appliedCoupon.desc})\n`;
    }
    message += `\n*Items Ordered:*\n`;
    
    cartItems.forEach((item) => {
      message += `• ${item.name} x${item.quantity} — ₹${item.price * item.quantity}\n`;
    });

    message += `\n*Subtotal:* ₹${subtotal.toFixed(2)}`;
    if (discountAmount > 0) {
      message += `\n*Discount (${appliedCoupon.code}):* -₹${discountAmount.toFixed(2)}`;
    }
    if (hasFreeGift) {
      message += `\n*Free Gift:* Special Royal Dessert included!`;
    }
    message += `\n*GST (5%):* ₹${gst.toFixed(2)}`;
    if (orderType === 'Delivery') {
      message += `\n*Delivery Charges:* ${deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}`;
    }
    message += `\n*Total Amount:* ₹${grandTotal.toFixed(2)}\n`;
    message += `*Payment Method:* ${paymentMethod}\n`;
    message += `*Special Instructions:* ${instructionsText}\n\n`;
    message += `Please confirm my order and prepare the feast!`;

    const encoded = encodeURIComponent(message);
    const whatsappNum = restaurantInfo.phone.replace(/[^0-9]/g, '');
    
    // Redirect to WhatsApp
    window.open(`https://wa.me/${whatsappNum}?text=${encoded}`, '_blank');

    // Show order confirmation screen
    setConfirmedOrder(newOrder);
    setIsSubmitting(false);
    showSuccess('Order placed successfully!', {
      label: 'View Order',
      onClick: () => {
        onClose();
        navigate('/dashboard?tab=orders');
      }
    });

    // Notify administrator (cross-tab via localStorage and same-tab via CustomEvent)
    window.dispatchEvent(new CustomEvent('admin-new-order', { detail: newOrder }));
    try {
      const pendingAdminNotifs = JSON.parse(localStorage.getItem('rb_pending_admin_notifs') || '[]');
      pendingAdminNotifs.push({ type: 'order', orderId, customerName: name, time: Date.now() });
      localStorage.setItem('rb_pending_admin_notifs', JSON.stringify(pendingAdminNotifs));
    } catch (e) {}

    // Trigger callback to App to update state and clear cart
    onOrderSuccess(updatedUser);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderId = `RB-${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Estimated delivery time
    let estTime = '35 - 45 mins';
    if (orderType === 'Pickup') estTime = '15 - 20 mins';
    if (orderType === 'Dine In') estTime = 'Ready at Table in 20 mins';

    // Build special instructions text
    const instructions = [];
    if (extraSpicy) instructions.push('Extra Spicy');
    if (lessOil) instructions.push('Less Oil');
    if (customNote.trim()) instructions.push(customNote.trim());
    const instructionsText = instructions.length > 0 ? instructions.join(', ') : 'None';

    const orderDetails = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      discount: discountAmount,
      coupon: appliedCoupon ? appliedCoupon.code : 'None',
      hasGift: hasFreeGift,
      gst,
      deliveryCharge,
      total: grandTotal,
      orderType,
      paymentMethod,
      specialInstructions: instructionsText,
      estimatedTime: estTime,
      status: 'Order Received'
    };

    // 1. If payment method is COD, process order immediately
    if (paymentMethod === 'COD') {
      await finalizeOrder(orderId, estTime, instructionsText, { paymentStatus: 'Pending' });
      return;
    }

    // 2. Otherwise, use Razorpay payment gateway
    try {
      // Load Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript();
      
      // Request Razorpay Order ID from backend
      let rzpOrderRes;
      try {
        rzpOrderRes = await api.createRazorpayOrder({ amount: grandTotal });
      } catch (apiErr) {
        console.warn('Failed to create Razorpay Order on server, falling back to local simulation:', apiErr.message);
      }

      // If we got a mock order ID, or script loading failed, trigger the Sandbox Simulator
      const isMockOrDummy = !rzpOrderRes || !rzpOrderRes.success || rzpOrderRes.data.isMock || !scriptLoaded || rzpOrderRes.data.id.startsWith('order_mock_');

      if (isMockOrDummy) {
        const mockRzpOrderId = rzpOrderRes?.data?.id || `order_mock_${Math.floor(Math.random() * 900000) + 100000}`;
        setSandboxOrder({
          id: mockRzpOrderId,
          amount: grandTotal,
          orderDetails,
          estTime,
          instructionsText
        });
        setIsSubmitting(false);
        return;
      }

      // Open Real Razorpay Widget
      const options = {
        key: rzpOrderRes.key || 'rzp_test_dummyId2026',
        amount: rzpOrderRes.data.amount,
        currency: rzpOrderRes.data.currency || 'INR',
        name: 'Royal Bites',
        description: 'Fine Dining Restaurant Order Payment',
        order_id: rzpOrderRes.data.id,
        handler: async function (response) {
          const paymentToastId = showLoading('Processing payment...');
          setIsSubmitting(true);
          try {
            // Verify payment on the server
            const verifyRes = await api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails
            });

            if (verifyRes.success) {
              resolveLoading(paymentToastId, 'success', 'Payment successful!');
              await finalizeOrder(orderId, estTime, instructionsText, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentStatus: 'Paid'
              });
            } else {
              resolveLoading(paymentToastId, 'error', 'Payment signature verification failed.');
              setIsSubmitting(false);
            }
          } catch (err) {
            console.error('Payment verification API error:', err);
            toast.dismiss(paymentToastId);
            showWarning('Unable to verify payment with server. Proceeding offline.');
            await finalizeOrder(orderId, estTime, instructionsText, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentStatus: 'Paid'
            });
          }
        },
        prefill: {
          name,
          email,
          contact: phone
        },
        theme: {
          color: '#E0A96D' // Gold color theme matching Royal Bites
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            showWarning('Payment cancelled by customer.');
          }
        }
      };

      const rzpObj = new window.Razorpay(options);
      rzpObj.open();
    } catch (error) {
      console.error('Razorpay payment gateway error:', error);
      showWarning('Error initializing payment. Falling back to local checkout simulation.');
      setSandboxOrder({
        id: `order_mock_${Math.floor(Math.random() * 900000) + 100000}`,
        amount: grandTotal,
        orderDetails,
        estTime,
        instructionsText
      });
      setIsSubmitting(false);
    }
  };

  const handleConfirmationClose = () => {
    setConfirmedOrder(null);
    onClose();
  };

  // If order is successfully placed, render the confirmation screen (Phase 1 Requirement 4)
  if (confirmedOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-navy-dark/90 backdrop-blur-lg transition-opacity duration-300" />

        {/* Success Card */}
        <div className="relative w-full max-w-lg glass-strong rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-white/20 flex flex-col p-8 text-center">
          
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 mb-6 animate-bounce">
            <Check className="w-10 h-10 text-navy font-bold" />
          </div>

          <p className="text-sunset uppercase tracking-[0.25em] text-xs font-bold mb-2">
            Status: Order Received
          </p>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-gradient mb-2">
            Order Confirmed!
          </h3>
          <p className="text-xs text-cream/60 mb-6">
            Your order has been logged successfully and forwarded to WhatsApp for instant confirmation.
          </p>

          {/* Delivery estimate / order detail badge */}
          <div className="glass p-5 rounded-2xl border border-white/10 mb-6 flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sunset/20 text-sunset">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-cream/40 block leading-none mb-1 uppercase tracking-wider">Estimated Time</span>
                <span className="text-sm font-bold text-cream">{confirmedOrder.estimatedTime}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/5 text-xs">
              <div>
                <span className="text-[10px] text-cream/40 block leading-none mb-1 uppercase tracking-wider">ORDER ID</span>
                <span className="font-mono font-bold text-gold">{confirmedOrder.id}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-cream/40 block leading-none mb-1 uppercase tracking-wider">TOTAL AMOUNT</span>
                <span className="font-bold text-cream">₹{confirmedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Summary list */}
          <div className="glass p-4 rounded-xl max-h-36 overflow-y-auto no-scrollbar text-xs text-left mb-6 divide-y divide-white/5 space-y-1">
            <span className="text-[10px] font-bold text-gold uppercase tracking-wider block pb-2">Order Items ({confirmedOrder.items.reduce((sum, i) => sum + i.quantity, 0)})</span>
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2">
                <span className="text-cream/80">{item.name} <span className="text-cream/40">x{item.quantity}</span></span>
                <span className="text-cream font-semibold">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleConfirmationClose}
            className="w-full btn-primary py-3 rounded-xl font-bold cursor-pointer text-sm"
          >
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-navy-dark/80 backdrop-blur-md transition-opacity duration-300" 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl glass-strong rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
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
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-cream">Checkout Order</h3>
            <p className="text-xs text-cream/50">Configure your order types, payment, and notes</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          <div className="p-6 space-y-6 flex-1">
            
            {/* 1. Order Type Selection */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" />
                1. Select Order Type
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Delivery', label: 'Delivery', icon: Compass },
                  { id: 'Pickup', label: 'Self Pickup', icon: Store },
                  { id: 'Dine In', label: 'Dine In', icon: Utensils }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setOrderType(type.id)}
                    className={`p-3.5 rounded-2xl border text-xs font-semibold transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      orderType === type.id
                        ? 'border-sunset bg-sunset/10 text-cream scale-[1.02] shadow-lg shadow-sunset/15'
                        : 'border-white/10 glass text-cream/60 hover:bg-white/5'
                    }`}
                  >
                    <type.icon className={`w-5 h-5 ${orderType === type.id ? 'text-sunset' : 'text-cream/40'}`} />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Customer Contact & Delivery Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                2. Contact & Address Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-cream/50 mb-1 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field pl-10 py-2.5 text-xs"
                      placeholder="e.g. Saurabh"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-cream/50 mb-1 font-medium">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field pl-10 py-2.5 text-xs"
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[11px] text-cream/50 mb-1 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10 py-2.5 text-xs"
                      placeholder="e.g. saurabh@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Show address fields only for Delivery */}
              {orderType === 'Delivery' && (
                <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  {currentUser.savedAddresses && currentUser.savedAddresses.length > 0 && (
                    <div>
                      <span className="block text-[10px] text-cream/40 mb-1.5 uppercase tracking-wider">Use Saved Address</span>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setAddress(addr.address || '');
                              setLandmark(addr.landmark || '');
                              setCity(addr.city || '');
                              setPincode(addr.pincode || '');
                            }}
                            className="px-3 py-1.5 rounded-xl border border-white/10 glass hover:border-sunset/40 text-[10px] font-semibold text-cream/80 hover:text-cream cursor-pointer transition-all duration-300"
                          >
                            📍 {addr.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] text-cream/50 mb-1 font-medium">Complete Delivery Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="input-field pl-10 py-2.5 text-xs h-16 resize-none"
                        placeholder="Flat/House No., Building, Street Name"
                        required={orderType === 'Delivery'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] text-cream/50 mb-1 font-medium">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="input-field py-2.5 text-xs"
                        placeholder="e.g. Near VIP Lake"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-cream/50 mb-1 font-medium">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="input-field py-2.5 text-xs"
                        placeholder="e.g. Bhopal"
                        required={orderType === 'Delivery'}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-cream/50 mb-1 font-medium">Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="input-field py-2.5 text-xs"
                        placeholder="e.g. 462001"
                        required={orderType === 'Delivery'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Special Instructions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                3. Special Instructions
              </h4>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setExtraSpicy(!extraSpicy)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    extraSpicy
                      ? 'border-sunset bg-sunset/15 text-cream font-bold'
                      : 'border-white/10 glass text-cream/60 hover:bg-white/5'
                  }`}
                >
                  🌶️ Extra Spicy
                  {extraSpicy && <Check className="w-3.5 h-3.5 text-sunset" />}
                </button>

                <button
                  type="button"
                  onClick={() => setLessOil(!lessOil)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    lessOil
                      ? 'border-sunset bg-sunset/15 text-cream font-bold'
                      : 'border-white/10 glass text-cream/60 hover:bg-white/5'
                  }`}
                >
                  💧 Less Oil
                  {lessOil && <Check className="w-3.5 h-3.5 text-sunset" />}
                </button>
              </div>

              <div>
                <label className="block text-[11px] text-cream/50 mb-1 font-medium">Custom Note</label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="input-field py-2 text-xs h-12 resize-none"
                  placeholder="e.g. Deliver contactlessly at the gate, don't ring bell..."
                />
              </div>
            </div>

            {/* Coupon Promo Code Block (New Phase 3 Feature) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Apply Coupon Code
              </h4>
              
              {appliedCoupon ? (
                <div className="p-3.5 rounded-xl border border-green-500/30 bg-green-500/5 text-green-300 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold block text-cream">Coupon Applied: {appliedCoupon.code}</span>
                    <span className="text-[10px] text-cream/60">{appliedCoupon.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-2.5 py-1 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors text-[10px] font-bold cursor-pointer bg-transparent"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. ROYAL20"
                      className="input-field py-2 text-xs flex-1 uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-gradient-to-r from-sunset to-gold text-navy rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer border-0"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-pink font-semibold">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-green-400 font-semibold">{couponSuccess}</p>
                  )}
                  
                  {/* List of active coupon codes for quick suggestion */}
                  <div className="space-y-2.5 pt-1 text-[10px]">
                    <span className="text-cream/40 font-semibold uppercase tracking-wider block">Available Coupons:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {couponsList
                        .filter(c => {
                          const isActive = c.active !== undefined ? c.active : (c.status === 'active');
                          const today = new Date().toISOString().split('T')[0];
                          const notExpired = !c.expiryDate || today <= c.expiryDate;
                          return isActive && notExpired;
                        })
                        .map((coupon) => {
                          const maxDisc = coupon.maximumDiscount !== undefined ? coupon.maximumDiscount : coupon.maxDiscount;
                          const descriptionText = coupon.description || coupon.desc;
                          return (
                            <div key={coupon.code} className="glass p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-gold">{coupon.code}</span>
                                  {maxDisc > 0 && (
                                    <span className="text-[8px] bg-sunset/15 px-1.5 py-0.5 rounded text-sunset font-bold">Max Disc: ₹{maxDisc}</span>
                                  )}
                                </div>
                                <p className="text-[9px] text-cream/50 mt-0.5">{descriptionText}</p>
                                {coupon.expiryDate && (
                                  <span className="text-[8px] text-pink/60 block mt-0.5">Expires: {coupon.expiryDate}</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setCouponCode(coupon.code);
                                  setCouponError('');
                                  setCouponSuccess('');
                                }}
                                className="px-2.5 py-1 bg-white/5 border border-white/10 hover:border-sunset hover:text-sunset font-bold rounded-lg text-[9px] cursor-pointer"
                              >
                                Select
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Payment Options (Phase 1 Requirement 3) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                4. Select Payment Method
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'Google Pay', label: 'Google Pay' },
                  { id: 'PhonePe', label: 'PhonePe' },
                  { id: 'Paytm', label: 'Paytm' },
                  { id: 'UPI', label: 'BHIM UPI' },
                  { id: 'Credit Card', label: 'Credit Card' },
                  { id: 'Debit Card', label: 'Debit Card' },
                  { id: 'Net Banking', label: 'Net Banking' },
                  { id: 'COD', label: orderType === 'Delivery' ? 'Cash on Delivery' : 'Pay at Restaurant' }
                ].map((pay) => (
                  <button
                    key={pay.id}
                    type="button"
                    onClick={() => setPaymentMethod(pay.id)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all flex flex-col justify-center items-center gap-1 cursor-pointer ${
                      paymentMethod === pay.id
                        ? 'border-sunset bg-sunset/10 text-cream'
                        : 'border-white/10 glass text-cream/60 hover:bg-white/5'
                    }`}
                  >
                    <span className="block truncate max-w-full text-[11px]">{pay.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Detailed Receipt Review */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                5. Order Summary
              </h4>
              <div className="glass p-4 rounded-2xl max-h-36 overflow-y-auto no-scrollbar space-y-2.5">
                {cartItems.map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <span className="text-cream/80">{item.name} <span className="text-cream/40">x{item.quantity}</span></span>
                    <span className="text-cream font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="glass p-4 rounded-2xl border border-white/5 space-y-1.5 text-xs text-cream/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-cream">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-400 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {hasFreeGift && (
                  <div className="flex justify-between text-green-400 font-medium">
                    <span>Gift Added</span>
                    <span>Free Royal Dessert</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-cream">₹{gst.toFixed(2)}</span>
                </div>
                {orderType === 'Delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="font-semibold text-cream">
                      {deliveryCharge === 0 ? <span className="text-green-400 font-bold">FREE</span> : `₹${deliveryCharge.toFixed(2)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-navy/85 border-t border-white/10 flex items-center justify-between mt-auto">
            <div>
              <span className="text-[10px] text-cream/40 block uppercase tracking-wider">Grand Total</span>
              <span className="font-display text-2xl font-bold text-gradient">₹{grandTotal.toFixed(2)}</span>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-sunset to-gold text-navy hover:shadow-lg hover:shadow-sunset/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming...' : 'Place Order & WhatsApp'}
            </button>
          </div>
        </form>
      </div>
      {/* Sandbox Simulator Modal */}
      {sandboxOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setSandboxOrder(null)}
            className="absolute inset-0 bg-navy-dark/95 backdrop-blur-md" 
          />
          <div className="relative w-full max-w-md glass-strong rounded-3xl p-6 border border-white/20 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 rounded-full bg-sunset/10 flex items-center justify-center text-sunset mb-4">
              <CreditCard className="w-8 h-8" />
            </div>
            <h4 className="font-display text-xl font-bold text-gradient mb-2">Test Payment Sandbox</h4>
            <p className="text-xs text-cream/70 mb-4">
              Dummy credentials detected. Simulating Razorpay checkout interface.
            </p>

            <div className="glass p-4 rounded-2xl border border-white/5 text-left text-xs mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-cream/50">Simulated Order ID:</span>
                <span className="font-mono text-gold font-bold">{sandboxOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/50">Amount to Pay:</span>
                <span className="text-cream font-bold">₹{sandboxOrder.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/50">Customer Name:</span>
                <span className="text-cream font-bold">{sandboxOrder.orderDetails.customerName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={async () => {
                  const currentSandbox = sandboxOrder;
                  setSandboxOrder(null);
                  const paymentToastId = showLoading('Processing payment...');
                  setIsSubmitting(true);
                  try {
                    const mockPayId = `pay_mock_${Math.floor(Math.random() * 900000) + 100000}`;
                    const mockSignature = `sig_mock_${Math.floor(Math.random() * 900000) + 100000}`;
                    
                    const verifyRes = await api.verifyRazorpayPayment({
                      razorpay_order_id: currentSandbox.id,
                      razorpay_payment_id: mockPayId,
                      razorpay_signature: mockSignature,
                      orderDetails: currentSandbox.orderDetails
                    });

                    if (verifyRes.success) {
                      resolveLoading(paymentToastId, 'success', 'Payment successful!');
                      await finalizeOrder(
                        currentSandbox.orderDetails.id,
                        currentSandbox.estTime,
                        currentSandbox.instructionsText,
                        {
                          razorpayOrderId: currentSandbox.id,
                          razorpayPaymentId: mockPayId,
                          razorpaySignature: mockSignature,
                          paymentStatus: 'Paid'
                        }
                      );
                    } else {
                      resolveLoading(paymentToastId, 'error', 'Payment verification failed.');
                      setIsSubmitting(false);
                    }
                  } catch (err) {
                    console.error('Verify failed:', err);
                    toast.dismiss(paymentToastId);
                    showWarning('Payment verification failed on server. Falling back to local checkout.');
                    await finalizeOrder(
                      currentSandbox.orderDetails.id,
                      currentSandbox.estTime,
                      currentSandbox.instructionsText,
                      {
                        razorpayOrderId: currentSandbox.id,
                        razorpayPaymentId: `pay_mock_${Date.now()}`,
                        razorpaySignature: 'sig_mock_offline',
                        paymentStatus: 'Paid'
                      }
                    );
                  }
                }}
                className="w-full btn-primary py-3 rounded-xl font-bold text-xs cursor-pointer"
              >
                Simulate Successful Payment
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSandboxOrder(null);
                  showError('Payment failed. (Simulated)');
                }}
                className="w-full py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 font-bold text-xs hover:bg-red-500/10 cursor-pointer"
              >
                Simulate Payment Failure
              </button>

              <button
                type="button"
                onClick={() => setSandboxOrder(null)}
                className="w-full py-2.5 text-[11px] text-cream/40 hover:text-cream cursor-pointer"
              >
                Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
