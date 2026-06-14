import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown, Calendar, MessageSquare, RefreshCw, Trash2, LogOut, Lock, 
  ArrowLeft, DollarSign, ShoppingBag, TrendingUp, User, Plus, Edit3, 
  Star, CheckCircle2, XCircle, X, Tag, Sliders, ShieldAlert, Sparkles, Check,
  Download
} from 'lucide-react';
import { api } from '../api/api';
import { showSuccess, showError, showWarning, showConfirm, showInfo, showLoading, resolveLoading } from '../utils/toast';

const downloadCSV = (filename, headers, rows) => {
  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCSV).join(',');
  const rowLines = rows.map(row => row.map(escapeCSV).join(','));
  const csvContent = [headerLine, ...rowLines].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const BOOKING_STATUSES = ['pending', 'confirmed', 'seated', 'completed', 'cancelled'];
const INQUIRY_STATUSES = ['new', 'in-progress', 'completed'];
const ORDER_STATUSES = ['Order Received', 'Preparing', 'Ready', 'Out For Delivery', 'Delivered', 'Cancelled'];

function StatusBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    confirmed: 'bg-green-500/20 text-green-300 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
    seated: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-300 border-green-500/30',
    new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'in-progress': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'order received': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    preparing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    ready: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'out for delivery': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border capitalize ${
        colors[status.toLowerCase()] || 'bg-white/10 text-cream/70 border-white/20'
      }`}
    >
      {status}
    </span>
  );
}

export default function AdminDashboard({ menuCategories, onUpdateMenu }) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('rb_admin') === 'true'
  );
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState('analytics');
  
  // Backed states
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Local storage lists
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Detail Modal states
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Customer Filters
  const [customerSearchName, setCustomerSearchName] = useState('');
  const [customerSearchEmail, setCustomerSearchEmail] = useState('');
  const [customerMinOrders, setCustomerMinOrders] = useState('');
  const [customerMinSpend, setCustomerMinSpend] = useState('');

  // Coupon Creation Form
  // Coupon Creation & Edit Form
  const [isEditingCoupon, setIsEditingCoupon] = useState(false);
  const [editingCouponCode, setEditingCouponCode] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState('percentage');
  const [newCouponValue, setNewCouponValue] = useState(15);
  const [newCouponMinSpend, setNewCouponMinSpend] = useState(299);
  const [newCouponMaxDiscount, setNewCouponMaxDiscount] = useState(100);
  const [newCouponExpiryDate, setNewCouponExpiryDate] = useState('2027-12-31');
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState(50);
  const [newCouponStatus, setNewCouponStatus] = useState('active');
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Dish Management Form
  const [isEditingDish, setIsEditingDish] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [activeDishName, setActiveDishName] = useState('');
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState(199);
  const [dishImage, setDishImage] = useState('/menu/paneer-tikka.jpg');
  const [dishDesc, setDishDesc] = useState('');
  const [dishTag, setDishTag] = useState('');
  const [dishIsVeg, setDishIsVeg] = useState(true);
  const [dishAvailable, setDishAvailable] = useState(true);
  const [dishPopular, setDishPopular] = useState(false);
  
  // Category selection for Add Dish
  const [selectedAddCatId, setSelectedAddCatId] = useState('');

  // Reviews filters
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all');

  const handleExportOrders = () => {
    const ordersToExport = orders || [];
    if (ordersToExport.length === 0) {
      showWarning('No orders available to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Customer Name',
      'Phone',
      'Email',
      'Items',
      'Quantity',
      'Total Amount',
      'Payment Method',
      'Order Status',
      'Date'
    ];

    const rows = ordersToExport.map(o => {
      let name = o.customerName || '';
      let phone = o.customerPhone || '';
      let email = o.customerEmail || '';

      if (customers && customers.length > 0 && (!name || !phone || !email)) {
        const matchingCust = customers.find(c => 
          (c.orders || []).some(custOrder => custOrder.id === o.id)
        );
        if (matchingCust) {
          name = name || matchingCust.name;
          phone = phone || matchingCust.phone;
          email = email || matchingCust.email;
        }
      }

      name = name || 'Guest';
      phone = phone || 'N/A';
      email = email || 'N/A';

      const itemsStr = (o.items || []).map(item => `${item.name} x${item.quantity}`).join(' | ');
      const totalQty = (o.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

      return [
        o.id || '',
        name,
        phone,
        email,
        itemsStr,
        totalQty,
        `₹${(o.total || 0).toFixed(2)}`,
        o.paymentMethod || '',
        o.status || '',
        o.date || ''
      ];
    });

    downloadCSV('orders-report.csv', headers, rows);
  };

  const handleExportCustomers = () => {
    const customersToExport = customers || [];
    if (customersToExport.length === 0) {
      showWarning('No customers available to export.');
      return;
    }

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Registration Date',
      'Total Orders',
      'Total Spend'
    ];

    const rows = customersToExport.map(c => {
      const metrics = getCustomerMetrics(c);
      return [
        c.name || '',
        c.email || '',
        c.phone || '',
        metrics.regDate,
        metrics.orderCount,
        `₹${metrics.totalSpent.toFixed(2)}`
      ];
    });

    downloadCSV('customers-report.csv', headers, rows);
  };

  const handleExportRevenue = () => {
    const ordersList = orders || [];
    const completed = ordersList.filter(o => o.status === 'Delivered');
    if (completed.length === 0) {
      showWarning('No delivered orders available to generate revenue report.');
      return;
    }

    const headers = [
      'Date',
      'Orders Count',
      'Revenue',
      'Average Order Value'
    ];

    const grouped = {};
    completed.forEach(o => {
      const d = o.date;
      if (!d) return;
      if (!grouped[d]) {
        grouped[d] = { count: 0, revenue: 0 };
      }
      grouped[d].count += 1;
      grouped[d].revenue += o.total || 0;
    });

    const dates = Object.keys(grouped).sort();
    const rows = dates.map(d => {
      const count = grouped[d].count;
      const revenue = grouped[d].revenue;
      const aov = count > 0 ? revenue / count : 0;
      return [
        d,
        count,
        `₹${revenue.toFixed(2)}`,
        `₹${aov.toFixed(2)}`
      ];
    });

    downloadCSV('revenue-report.csv', headers, rows);
  };

  const handleExportReviews = () => {
    const reviewsToExport = reviews || [];
    if (reviewsToExport.length === 0) {
      showWarning('No reviews available to export.');
      return;
    }

    const headers = [
      'Customer Name',
      'Dish',
      'Rating',
      'Review',
      'Date',
      'Status'
    ];

    const rows = reviewsToExport.map(r => {
      const dishesStr = (r.items || []).join(' | ') || 'N/A';
      return [
        r.customerName || '',
        dishesStr,
        `${r.rating}★`,
        r.comment || '',
        r.date || '',
        r.status || 'approved'
      ];
    });

    downloadCSV('reviews-report.csv', headers, rows);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    let ordersData = null;
    let bookingsData = null;
    let inquiriesData = null;
    let reviewsData = null;
    let couponsData = null;
    try {
      const [bookingsRes, inquiriesRes, ordersRes, reviewsRes, couponsRes] = await Promise.all([
        api.getBookings().catch(err => {
          console.warn('Failed to fetch bookings from MongoDB, falling back to localStorage:', err.message);
          return { success: false, data: null };
        }),
        api.getInquiries().catch(err => {
          console.warn('Failed to fetch inquiries from MongoDB, falling back to localStorage:', err.message);
          return { success: false, data: null };
        }),
        api.getOrders().catch(err => {
          console.warn('Failed to fetch orders from MongoDB, falling back to localStorage:', err.message);
          return { success: false, data: null };
        }),
        api.getReviews().catch(err => {
          console.warn('Failed to fetch reviews from MongoDB, falling back to localStorage:', err.message);
          return { success: false, data: null };
        }),
        api.getCoupons().catch(err => {
          console.warn('Failed to fetch coupons from MongoDB, falling back to localStorage:', err.message);
          return { success: false, data: null };
        })
      ]);
      if (bookingsRes && bookingsRes.success) {
        bookingsData = bookingsRes.data;
      }
      if (inquiriesRes && inquiriesRes.success) {
        inquiriesData = inquiriesRes.data;
      }
      if (ordersRes && ordersRes.success) {
        ordersData = ordersRes.data;
      }
      if (reviewsRes && reviewsRes.success) {
        reviewsData = reviewsRes.data;
      }
      if (couponsRes && couponsRes.success) {
        couponsData = couponsRes.data;
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      // Sync local storage lists
      const localBookings = JSON.parse(localStorage.getItem('rb_bookings') || '[]');
      setBookings(bookingsData !== null ? bookingsData : localBookings);

      const localInquiries = JSON.parse(localStorage.getItem('rb_inquiries') || '[]');
      setInquiries(inquiriesData !== null ? inquiriesData : localInquiries);

      const localOrders = JSON.parse(localStorage.getItem('rb_all_orders') || '[]');
      setOrders(ordersData !== null ? ordersData : localOrders);

      setCustomers(JSON.parse(localStorage.getItem('registeredUsers') || '[]'));
      
      const localCoupons = JSON.parse(localStorage.getItem('rb_coupons') || '[]');
      if (couponsData !== null) {
        localStorage.setItem('rb_coupons', JSON.stringify(couponsData));
        setCoupons(couponsData);
      } else {
        setCoupons(localCoupons);
      }
      
      let storedReviews = localStorage.getItem('rb_reviews');
      if (reviewsData !== null) {
        // Sync API reviews to localStorage
        localStorage.setItem('rb_reviews', JSON.stringify(reviewsData));
        setReviews(reviewsData);
      } else {
        if (!storedReviews || JSON.parse(storedReviews).length === 0) {
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
          localStorage.setItem('rb_reviews', JSON.stringify(defaultReviews));
          storedReviews = JSON.stringify(defaultReviews);
        }
        setReviews(JSON.parse(storedReviews));
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated, fetchData]);

  useEffect(() => {
    if (!authenticated) return;

    // 1. Same-tab custom event handlers
    const handleNewOrder = (e) => {
      const order = e.detail;
      showInfo(`New order received from ${order.customerName || 'Customer'} (Total: ₹${order.total || 0})`, {
        label: 'View Orders',
        onClick: () => setTab('orders')
      });
      fetchData();
    };

    const handleNewBooking = (e) => {
      const booking = e.detail;
      showInfo(`New booking request from ${booking.name || 'Guest'} for ${booking.guests} guests`, {
        label: 'View Bookings',
        onClick: () => setTab('bookings')
      });
      fetchData();
    };

    const handleNewReview = (e) => {
      const review = e.detail;
      showInfo(`New review submitted: "${review.comment?.substring(0, 25) || ''}..."`, {
        label: 'View Reviews',
        onClick: () => setTab('reviews')
      });
      fetchData();
    };

    window.addEventListener('admin-new-order', handleNewOrder);
    window.addEventListener('admin-new-booking', handleNewBooking);
    window.addEventListener('admin-new-review', handleNewReview);

    // 2. Cross-tab storage listener
    const handleStorageNotif = (e) => {
      if (e.key === 'rb_pending_admin_notifs' && e.newValue) {
        try {
          const notifs = JSON.parse(e.newValue);
          if (notifs.length > 0) {
            notifs.forEach(notif => {
              if (notif.type === 'order') {
                showInfo(`New order received from ${notif.customerName} (ID: ${notif.orderId})`, {
                  label: 'View Orders',
                  onClick: () => setTab('orders')
                });
              } else if (notif.type === 'booking') {
                showInfo(`New booking request from ${notif.name}`, {
                  label: 'View Bookings',
                  onClick: () => setTab('bookings')
                });
              } else if (notif.type === 'review') {
                showInfo(`New review submitted by ${notif.name}`, {
                  label: 'View Reviews',
                  onClick: () => setTab('reviews')
                });
              }
            });
            localStorage.setItem('rb_pending_admin_notifs', '[]');
            fetchData();
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageNotif);

    // Check on mount for any missed notifications
    try {
      const pending = JSON.parse(localStorage.getItem('rb_pending_admin_notifs') || '[]');
      if (pending.length > 0) {
        pending.forEach(notif => {
          if (notif.type === 'order') {
            showInfo(`New order received from ${notif.customerName} (ID: ${notif.orderId})`, {
              label: 'View Orders',
              onClick: () => setTab('orders')
            });
          } else if (notif.type === 'booking') {
            showInfo(`New booking request from ${notif.name}`, {
              label: 'View Bookings',
              onClick: () => setTab('bookings')
            });
          } else if (notif.type === 'review') {
            showInfo(`New review submitted by ${notif.name}`, {
              label: 'View Reviews',
              onClick: () => setTab('reviews')
            });
          }
        });
        localStorage.setItem('rb_pending_admin_notifs', '[]');
        fetchData();
      }
    } catch (err) {}

    return () => {
      window.removeEventListener('admin-new-order', handleNewOrder);
      window.removeEventListener('admin-new-booking', handleNewBooking);
      window.removeEventListener('admin-new-review', handleNewReview);
      window.removeEventListener('storage', handleStorageNotif);
    };
  }, [authenticated, fetchData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await api.adminLogin(password);
      if (res && res.token) {
        localStorage.setItem('rb_token', res.token);
      }
      sessionStorage.setItem('rb_admin', 'true');
      setAuthenticated(true);
    } catch {
      setLoginError('Invalid password. Try: royalbites2026');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('rb_admin');
    setAuthenticated(false);
    setPassword('');
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  // BOOKING CONTROLS
  const updateBooking = async (id, status) => {
    const loadingToastId = showLoading('Saving booking...');
    try {
      const res = await api.updateBookingStatus(id, status);
      if (res.success) {
        console.log('Booking status successfully updated in MongoDB');
      }
    } catch (apiError) {
      console.warn('MongoDB booking status update failed, using localStorage fallback:', apiError.message);
    }

    // Always sync in localStorage to keep them identical or fallback gracefully
    const localBookings = JSON.parse(localStorage.getItem('rb_bookings') || '[]');
    const updatedBookings = localBookings.map(b => (b._id === id || b.id === id) ? { ...b, status } : b);
    localStorage.setItem('rb_bookings', JSON.stringify(updatedBookings));

    fetchData();
    resolveLoading(loadingToastId, 'success', `Booking marked as ${status}`);
  };

  const deleteBooking = (id) => {
    showConfirm('Delete this booking?', async () => {
      try {
        const res = await api.deleteBooking(id);
        if (res.success) {
          console.log('Booking successfully deleted from MongoDB');
        }
      } catch (apiError) {
        console.warn('MongoDB booking deletion failed, using localStorage fallback:', apiError.message);
      }

      // Always sync in localStorage
      const localBookings = JSON.parse(localStorage.getItem('rb_bookings') || '[]');
      const updatedBookings = localBookings.filter(b => b._id !== id && b.id !== id);
      localStorage.setItem('rb_bookings', JSON.stringify(updatedBookings));

      fetchData();
      showSuccess('Booking deleted successfully.');
    });
  };

  // INQUIRY CONTROLS
  const updateInquiry = async (id, status) => {
    await api.updateInquiryStatus(id, status);
    fetchData();
  };
  const deleteInquiry = (id) => {
    showConfirm('Delete this inquiry?', async () => {
      await api.deleteInquiry(id);
      fetchData();
      showSuccess('Inquiry deleted successfully.');
    });
  };

  // ORDER CONTROLS
  const updateOrderStatus = async (id, status) => {
    const loadingToastId = showLoading('Updating order...');
    try {
      const res = await api.updateOrderStatus(id, status);
      if (res.success) {
        console.log('Order status successfully updated in MongoDB');
      }
    } catch (apiError) {
      console.warn('MongoDB order status update failed, using localStorage fallback:', apiError.message);
    }

    const updatedOrders = orders.map(o => o.id === id ? { ...o, status } : o);
    localStorage.setItem('rb_all_orders', JSON.stringify(updatedOrders));
    
    // Sync current logged in user order details
    try {
      const session = localStorage.getItem('currentUser');
      if (session) {
        const currentUser = JSON.parse(session);
        if (currentUser && currentUser.orders) {
          const updatedUserOrders = currentUser.orders.map(o => o.id === id ? { ...o, status } : o);
          const updatedUser = { ...currentUser, orders: updatedUserOrders };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      }
    } catch (e) {
      console.error('Error parsing currentUser session:', e);
    }

    // Sync in registered users directory
    const updatedCustomers = customers.map(cust => {
      if (cust.orders) {
        const hasOrder = cust.orders.some(o => o.id === id);
        if (hasOrder) {
          const updatedO = cust.orders.map(o => o.id === id ? { ...o, status } : o);
          return { ...cust, orders: updatedO };
        }
      }
      return cust;
    });
    localStorage.setItem('registeredUsers', JSON.stringify(updatedCustomers));
    
    setOrders(updatedOrders);
    setCustomers(updatedCustomers);
    resolveLoading(loadingToastId, 'success', `Order status updated to: ${status}`);
  };

  const deleteOrder = (id) => {
    showConfirm('Delete this order permanently?', async () => {
      try {
        const res = await api.deleteOrder(id);
        if (res.success) {
          console.log('Order successfully deleted from MongoDB');
        }
      } catch (apiError) {
        console.warn('MongoDB order deletion failed, using localStorage fallback:', apiError.message);
      }

      const updatedOrders = orders.filter(o => o.id !== id);
      localStorage.setItem('rb_all_orders', JSON.stringify(updatedOrders));

      const updatedCustomers = customers.map(cust => {
        if (cust.orders) {
          const updatedO = cust.orders.filter(o => o.id !== id);
          return { ...cust, orders: updatedO };
        }
        return cust;
      });
      localStorage.setItem('registeredUsers', JSON.stringify(updatedCustomers));
      
      setOrders(updatedOrders);
      setCustomers(updatedCustomers);
      showSuccess('Order deleted permanently.');
    });
  };

  // REVENUE ANALYTICS CALCULATION (Phase 3 Requirement 1)
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  
  const getRevenueStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Total Revenue
    const totalRev = completedOrders.reduce((sum, o) => sum + o.total, 0);

    // Daily
    const dailyRev = completedOrders
      .filter(o => o.date === todayStr)
      .reduce((sum, o) => sum + o.total, 0);

    // Weekly (7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyRev = completedOrders
      .filter(o => new Date(o.date) >= sevenDaysAgo)
      .reduce((sum, o) => sum + o.total, 0);

    // Monthly (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyRev = completedOrders
      .filter(o => new Date(o.date) >= thirtyDaysAgo)
      .reduce((sum, o) => sum + o.total, 0);

    // Average Order Value
    const aov = completedOrders.length > 0 
      ? totalRev / completedOrders.length
      : 0;

    return { totalRev, dailyRev, weeklyRev, monthlyRev, aov };
  };

  const revenueStats = getRevenueStats();

  // POPULAR FOOD ANALYTICS (Phase 3 Requirement 3)
  const getFoodStats = () => {
    const dishCounts = {};
    const categoryCounts = {};

    // Initialize all menu items to 0 orders
    (menuCategories || []).forEach(cat => {
      cat.items.forEach(item => {
        dishCounts[item.name] = 0;
      });
    });

    completedOrders.forEach(o => {
      o.items.forEach(item => {
        dishCounts[item.name] = (dishCounts[item.name] || 0) + item.quantity;
        
        // Find category
        const details = (menuCategories || []).find(c => c.items.some(i => i.name === item.name));
        if (details) {
          categoryCounts[details.name] = (categoryCounts[details.name] || 0) + item.quantity;
        }
      });
    });

    const popularDishes = Object.keys(dishCounts)
      .map(name => ({ name, count: dishCounts[name] }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const popularCategories = Object.keys(categoryCounts)
      .map(name => ({ name, count: categoryCounts[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Low performing: sort all dishes ascending by order count
    const lowPerformingDishes = Object.keys(dishCounts)
      .map(name => ({ name, count: dishCounts[name] }))
      .sort((a, b) => a.count - b.count)
      .slice(0, 5);

    // Highly Rated / Popular Items
    const allDishes = [];
    (menuCategories || []).forEach(cat => {
      cat.items.forEach(item => {
        allDishes.push({ ...item, categoryName: cat.name });
      });
    });
    const highlyRatedItems = allDishes
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);

    return { popularDishes, popularCategories, lowPerformingDishes, highlyRatedItems };
  };

  const foodStats = getFoodStats();

  // CUSTOMER MANAGEMENT ACTIONS (Phase 3 Requirement 4)
  const getCustomerMetrics = (cust) => {
    const custOrders = cust.orders || [];
    const completedCustOrders = custOrders.filter(o => o.status === 'Delivered');
    const totalSpent = completedCustOrders.reduce((sum, o) => sum + o.total, 0);
    const lastOrder = custOrders.length > 0 ? custOrders[0] : null;
    const lastOrderDate = lastOrder ? lastOrder.date : 'N/A';
    
    return {
      orderCount: custOrders.length,
      totalSpent,
      lastOrderDate,
      regDate: cust.registrationDate || '2026-06-08'
    };
  };

  const getCustomerAnalytics = () => {
    const enriched = customers.map(cust => {
      const metrics = getCustomerMetrics(cust);
      return { ...cust, ...metrics };
    });

    const topCustomersBySpend = [...enriched]
      .filter(c => c.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 3);

    const mostActiveCustomers = [...enriched]
      .filter(c => c.orderCount > 0)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 3);

    const currentMonthStr = new Date().toISOString().substring(0, 7); // '2026-06'
    const newCustomersThisMonth = enriched.filter(c => c.regDate.startsWith(currentMonthStr)).length;

    return { topCustomersBySpend, mostActiveCustomers, newCustomersThisMonth, enriched };
  };

  const custAnalytics = getCustomerAnalytics();

  const filteredCustomers = custAnalytics.enriched.filter(cust => {
    const matchesName = !customerSearchName || cust.name.toLowerCase().includes(customerSearchName.toLowerCase());
    const matchesEmail = !customerSearchEmail || cust.email.toLowerCase().includes(customerSearchEmail.toLowerCase());
    const matchesMinOrders = !customerMinOrders || cust.orderCount >= Number(customerMinOrders);
    const matchesMinSpend = !customerMinSpend || cust.totalSpent >= Number(customerMinSpend);
    return matchesName && matchesEmail && matchesMinOrders && matchesMinSpend;
  });

  // COUPON ACTIONS (Phase 3 Requirement 5)
  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode.trim() || newCouponValue < 0) return;

    const payload = {
      code: newCouponCode.trim().toUpperCase(),
      description: newCouponDesc.trim() || `${newCouponType === 'percentage' ? `${newCouponValue}%` : `₹${newCouponValue}`} off on orders above ₹${newCouponMinSpend}`,
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      minimumOrderAmount: Number(newCouponMinSpend),
      maximumDiscount: Number(newCouponMaxDiscount),
      expiryDate: newCouponExpiryDate,
      usageLimit: Number(newCouponUsageLimit)
    };

    // Check if code already exists locally (or will fail on DB)
    if (coupons.some(c => c.code.toUpperCase() === payload.code)) {
      showError('Coupon code already exists.');
      return;
    }

    const runCreate = async () => {
      try {
        const res = await api.createCoupon(payload);
        if (res.success) {
          console.log('Coupon created in MongoDB');
        }
      } catch (err) {
        console.warn('Failed to create coupon in MongoDB, using local fallback:', err.message);
      }

      const newCouponLocal = {
        ...payload,
        type: newCouponType,
        value: Number(newCouponValue),
        minSpend: Number(newCouponMinSpend),
        maxDiscount: Number(newCouponMaxDiscount),
        status: newCouponStatus,
        desc: payload.description,
        usageCount: 0,
        active: newCouponStatus === 'active'
      };

      const updatedCoupons = [newCouponLocal, ...coupons];
      localStorage.setItem('rb_coupons', JSON.stringify(updatedCoupons));
      setCoupons(updatedCoupons);

      // Reset Form
      setNewCouponCode('');
      setNewCouponValue(15);
      setNewCouponMinSpend(299);
      setNewCouponMaxDiscount(100);
      setNewCouponExpiryDate('2027-12-31');
      setNewCouponUsageLimit(50);
      setNewCouponStatus('active');
      setNewCouponDesc('');
      showSuccess('Coupon created successfully!');
    };

    runCreate();
  };

  const handleStartEditCoupon = (c) => {
    setIsEditingCoupon(true);
    setEditingCouponCode(c.code);
    setNewCouponCode(c.code);
    setNewCouponType(c.discountType || c.type || 'percentage');
    setNewCouponValue(c.discountValue !== undefined ? c.discountValue : (c.value !== undefined ? c.value : 15));
    setNewCouponMinSpend(c.minimumOrderAmount !== undefined ? c.minimumOrderAmount : (c.minSpend || 0));
    setNewCouponMaxDiscount(c.maximumDiscount !== undefined ? c.maximumDiscount : (c.maxDiscount || 0));
    setNewCouponExpiryDate(c.expiryDate || '2027-12-31');
    setNewCouponUsageLimit(c.usageLimit || 50);
    setNewCouponStatus(c.active !== undefined ? (c.active ? 'active' : 'inactive') : (c.status || 'active'));
    setNewCouponDesc(c.description || c.desc || '');
  };

  const handleSaveEditCoupon = (e) => {
    e.preventDefault();

    const couponToEdit = coupons.find(c => c.code === editingCouponCode);
    const targetId = couponToEdit ? (couponToEdit._id || couponToEdit.code) : editingCouponCode;

    const payload = {
      description: newCouponDesc.trim() || `${newCouponType === 'percentage' ? `${newCouponValue}%` : `₹${newCouponValue}`} off on orders above ₹${newCouponMinSpend}`,
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      minimumOrderAmount: Number(newCouponMinSpend),
      maximumDiscount: Number(newCouponMaxDiscount),
      expiryDate: newCouponExpiryDate,
      usageLimit: Number(newCouponUsageLimit),
      active: newCouponStatus === 'active'
    };

    const runUpdate = async () => {
      try {
        const res = await api.updateCoupon(targetId, payload);
        if (res.success) {
          console.log('Coupon updated in MongoDB');
        }
      } catch (err) {
        console.warn('Failed to update coupon in MongoDB, using local fallback:', err.message);
      }

      const updatedCoupons = coupons.map(c => {
        if (c.code === editingCouponCode) {
          return {
            ...c,
            ...payload,
            type: newCouponType,
            value: Number(newCouponValue),
            minSpend: Number(newCouponMinSpend),
            maxDiscount: Number(newCouponMaxDiscount),
            status: newCouponStatus,
            desc: payload.description,
            active: newCouponStatus === 'active'
          };
        }
        return c;
      });

      localStorage.setItem('rb_coupons', JSON.stringify(updatedCoupons));
      setCoupons(updatedCoupons);

      // Reset
      setIsEditingCoupon(false);
      setEditingCouponCode('');
      setNewCouponCode('');
      setNewCouponValue(15);
      setNewCouponMinSpend(299);
      setNewCouponMaxDiscount(100);
      setNewCouponExpiryDate('2027-12-31');
      setNewCouponUsageLimit(50);
      setNewCouponStatus('active');
      setNewCouponDesc('');
      showSuccess('Coupon updated successfully!');
    };

    runUpdate();
  };

  const handleToggleCouponStatus = async (code) => {
    const couponToToggle = coupons.find(c => c.code === code);
    if (!couponToToggle) return;

    const currentActive = couponToToggle.active !== undefined 
      ? couponToToggle.active 
      : (couponToToggle.status === 'active');
    const nextActive = !currentActive;
    const nextStatus = nextActive ? 'active' : 'inactive';

    try {
      const targetId = couponToToggle._id || couponToToggle.code;
      const res = await api.updateCoupon(targetId, { active: nextActive });
      if (res.success) {
        console.log('Coupon status toggled in MongoDB');
      }
    } catch (err) {
      console.warn('Failed to toggle coupon status in MongoDB, using local fallback:', err.message);
    }

    const updatedCoupons = coupons.map(c => {
      if (c.code === code) {
        return { 
          ...c, 
          active: nextActive, 
          status: nextStatus 
        };
      }
      return c;
    });
    localStorage.setItem('rb_coupons', JSON.stringify(updatedCoupons));
    setCoupons(updatedCoupons);
  };

  const handleDeleteCoupon = (code) => {
    showConfirm(`Delete coupon ${code}?`, async () => {
      const couponToDelete = coupons.find(c => c.code === code);
      if (couponToDelete) {
        try {
          const targetId = couponToDelete._id || couponToDelete.code;
          const res = await api.deleteCoupon(targetId);
          if (res.success) {
            console.log('Coupon deleted from MongoDB');
          }
        } catch (err) {
          console.warn('Failed to delete coupon from MongoDB, using local fallback:', err.message);
        }
      }

      const updated = coupons.filter(c => c.code !== code);
      localStorage.setItem('rb_coupons', JSON.stringify(updated));
      setCoupons(updated);
      showSuccess('Coupon deleted successfully.');
    });
  };

  // REVIEWS ACTIONS (Phase 3 Requirement 6)
  const handleToggleFeaturedReview = async (id) => {
    const rev = reviews.find(r => r._id === id || r.id === id);
    if (!rev) return;
    const nextFeatured = !rev.featured;
    try {
      const res = await api.updateReview(id, { featured: nextFeatured });
      if (res.success) {
        console.log('Review featured status successfully updated in MongoDB');
      }
    } catch (apiError) {
      console.warn('MongoDB review featured update failed, using localStorage fallback:', apiError.message);
    }

    // Always sync in localStorage to keep them identical or fallback gracefully
    const localReviews = JSON.parse(localStorage.getItem('rb_reviews') || '[]');
    const updatedReviews = localReviews.map(r => 
      (r._id === id || r.id === id) ? { ...r, featured: nextFeatured } : r
    );
    localStorage.setItem('rb_reviews', JSON.stringify(updatedReviews));

    fetchData();
  };

  const handleApproveReview = async (id) => {
    try {
      const res = await api.updateReview(id, { status: 'approved' });
      if (res.success) {
        console.log('Review status successfully updated in MongoDB to approved');
      }
    } catch (apiError) {
      console.warn('MongoDB review approval failed, using localStorage fallback:', apiError.message);
    }

    const localReviews = JSON.parse(localStorage.getItem('rb_reviews') || '[]');
    const updatedReviews = localReviews.map(r => 
      (r._id === id || r.id === id) ? { ...r, status: 'approved' } : r
    );
    localStorage.setItem('rb_reviews', JSON.stringify(updatedReviews));

    fetchData();
  };

  const handleRejectReview = async (id) => {
    try {
      const res = await api.updateReview(id, { status: 'rejected' });
      if (res.success) {
        console.log('Review status successfully updated in MongoDB to rejected');
      }
    } catch (apiError) {
      console.warn('MongoDB review rejection failed, using localStorage fallback:', apiError.message);
    }

    const localReviews = JSON.parse(localStorage.getItem('rb_reviews') || '[]');
    const updatedReviews = localReviews.map(r => 
      (r._id === id || r.id === id) ? { ...r, status: 'rejected' } : r
    );
    localStorage.setItem('rb_reviews', JSON.stringify(updatedReviews));

    fetchData();
  };

  const handleDeleteReview = (id) => {
    showConfirm('Delete this review permanently?', async () => {
      try {
        const res = await api.deleteReview(id);
        if (res.success) {
          console.log('Review successfully deleted from MongoDB');
        }
      } catch (apiError) {
        console.warn('MongoDB review deletion failed, using localStorage fallback:', apiError.message);
      }

      const localReviews = JSON.parse(localStorage.getItem('rb_reviews') || '[]');
      const updatedReviews = localReviews.filter(r => r._id !== id && r.id !== id);
      localStorage.setItem('rb_reviews', JSON.stringify(updatedReviews));

      fetchData();
      showSuccess('Review deleted successfully.');
    });
  };


  // ADMIN MENU MANAGEMENT ACTIONS (Phase 3 Requirement 7)
  const handleAddDish = (e) => {
    e.preventDefault();
    if (!selectedAddCatId || !dishName.trim() || dishPrice <= 0) {
      showWarning('Please fill out Category, Name and Price.');
      return;
    }

    const newDish = {
      name: dishName.trim(),
      description: dishDesc.trim(),
      price: Number(dishPrice),
      image: dishImage.trim() || '/menu/paneer-tikka.jpg',
      tag: dishTag.trim() || undefined,
      rating: 4.8,
      isVeg: dishIsVeg,
      available: dishAvailable,
      popular: dishPopular
    };

    const updatedMenu = menuCategories.map(cat => {
      if (cat.id === selectedAddCatId) {
        return {
          ...cat,
          items: [...cat.items, newDish]
        };
      }
      return cat;
    });

    onUpdateMenu(updatedMenu);
    
    // Reset Form
    setDishName('');
    setDishDesc('');
    setDishPrice(199);
    setDishTag('');
    setDishIsVeg(true);
    setDishAvailable(true);
    setDishPopular(false);
    showSuccess('Dish added successfully!');
  };

  const handleStartEditDish = (catId, dish) => {
    setActiveCategoryId(catId);
    setActiveDishName(dish.name);
    setDishName(dish.name);
    setDishPrice(dish.price);
    setDishImage(dish.image);
    setDishDesc(dish.description || '');
    setDishTag(dish.tag || '');
    setDishIsVeg(dish.isVeg !== false);
    setDishAvailable(dish.available !== false);
    setDishPopular(dish.popular === true);
    setIsEditingDish(true);
  };

  const handleSaveEditDish = (e) => {
    e.preventDefault();
    
    const updatedMenu = menuCategories.map(cat => {
      if (cat.id === activeCategoryId) {
        const updatedItems = cat.items.map(item => {
          if (item.name === activeDishName) {
            return {
              ...item,
              name: dishName.trim(),
              price: Number(dishPrice),
              image: dishImage.trim(),
              description: dishDesc.trim(),
              tag: dishTag.trim() || undefined,
              isVeg: dishIsVeg,
              available: dishAvailable,
              popular: dishPopular
            };
          }
          return item;
        });
        return { ...cat, items: updatedItems };
      }
      return cat;
    });

    onUpdateMenu(updatedMenu);
    setIsEditingDish(false);
    setActiveCategoryId('');
    setActiveDishName('');
    setDishName('');
    setDishDesc('');
    setDishPrice(199);
    setDishTag('');
    setDishPopular(false);
    showSuccess('Dish updated successfully!');
  };

  const handleDeleteDish = (catId, name) => {
    showConfirm(`Delete dish "${name}" permanently?`, () => {
      const updatedMenu = menuCategories.map(cat => {
        if (cat.id === catId) {
          return {
            ...cat,
            items: cat.items.filter(item => item.name !== name)
          };
        }
        return cat;
      });

      onUpdateMenu(updatedMenu);
      showSuccess('Dish deleted successfully!');
    });
  };

  const handleToggleAvailability = (catId, name) => {
    const updatedMenu = menuCategories.map(cat => {
      if (cat.id === catId) {
        const updatedItems = cat.items.map(item => {
          if (item.name === name) {
            return { ...item, available: item.available === false ? true : false };
          }
          return item;
        });
        return { ...cat, items: updatedItems };
      }
      return cat;
    });
    onUpdateMenu(updatedMenu);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
        <div className="glass-strong rounded-3xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-sunset to-gold mb-4">
              <Crown className="w-8 h-8 text-navy" />
            </div>
            <h1 className="font-display text-3xl text-gradient font-bold">Admin Portal</h1>
            <p className="text-cream/60 mt-2 text-sm">Royal Bites Management Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-cream/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pl-11"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-red-300 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                {loginError}
              </p>
            )}

            <button type="submit" disabled={loginLoading} className="btn-primary w-full cursor-pointer">
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 mt-6 text-sm text-cream/50 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy pb-16">
      
      {/* Dashboard Sticky Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sunset to-gold">
              <Crown className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-gradient">Royal Bites Admin</h1>
              <p className="text-xs text-cream/50">Management & Analytics Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="btn-secondary py-2 px-4 text-sm cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link to="/" className="btn-secondary py-2 px-4 text-sm hidden sm:inline-flex">
              <ArrowLeft className="w-4 h-4" />
              Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl glass hover:bg-white/15 text-cream/70 cursor-pointer"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Panel */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Today Revenue', value: `₹${revenueStats.dailyRev.toFixed(0)}`, icon: DollarSign, color: 'sunset' },
            { label: 'Weekly Sales', value: `₹${revenueStats.weeklyRev.toFixed(0)}`, icon: DollarSign, color: 'gold' },
            { label: 'Avg. Ticket (AOV)', value: `₹${revenueStats.aov.toFixed(1)}`, icon: TrendingUp, color: 'pink' },
            { label: 'Active Orders', value: orders.filter(o => o.status !== 'Delivered').length, icon: ShoppingBag, color: 'sunset' },
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-cream/50 text-xs uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gold mt-1 font-display">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-sunset/30" />
            </div>
          ))}
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'orders', label: 'Orders Logs', icon: ShoppingBag },
            { id: 'menu', label: 'Menu Management', icon: Sliders },
            { id: 'customers', label: 'Customers', icon: User },
            { id: 'coupons', label: 'Coupon System', icon: Tag },
            { id: 'reviews', label: 'Reviews List', icon: Star },
            { id: 'bookings', label: 'Reservations', icon: Calendar },
            { id: 'inquiries', label: 'Queries', icon: MessageSquare },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setIsEditingDish(false);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 shrink-0 ${
                tab === id
                  ? 'bg-gradient-to-r from-sunset to-gold text-navy shadow-lg shadow-sunset/25'
                  : 'glass text-cream/70 hover:bg-white/15'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Revenue Analytics Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Revenue Analytics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Total Revenue', value: `₹${revenueStats.totalRev.toFixed(2)}`, desc: 'All-time sales revenue', color: 'sunset' },
                  { label: "Today's Revenue", value: `₹${revenueStats.dailyRev.toFixed(2)}`, desc: 'Revenue recorded today', color: 'gold' },
                  { label: 'Weekly Revenue', value: `₹${revenueStats.weeklyRev.toFixed(2)}`, desc: 'Last 7 days revenue', color: 'pink' },
                  { label: 'Monthly Revenue', value: `₹${revenueStats.monthlyRev.toFixed(2)}`, desc: 'Last 30 days revenue', color: 'sunset' },
                  { label: 'Avg Order Value (AOV)', value: `₹${revenueStats.aov.toFixed(2)}`, desc: 'Average ticket size', color: 'gold' },
                ].map((item, idx) => (
                  <div key={idx} className="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-cream/40 block uppercase tracking-wider font-semibold">{item.label}</span>
                      <span className="text-lg sm:text-xl font-bold text-cream mt-1 font-display block truncate">{item.value}</span>
                    </div>
                    <span className="text-[9px] text-cream/35 mt-2 block">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Analytics Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Order Analytics</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { label: 'Total Orders', value: orders.length, color: 'text-cream' },
                  { label: 'Pending Orders', value: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length, color: 'text-yellow-300' },
                  { label: 'Preparing', value: orders.filter(o => o.status === 'Preparing').length, color: 'text-orange-400' },
                  { label: 'Out for Delivery', value: orders.filter(o => o.status === 'Out For Delivery').length, color: 'text-pink' },
                  { label: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length, color: 'text-green-400' },
                  { label: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').length, color: 'text-red-400' },
                ].map((item, idx) => (
                  <div key={idx} className="glass p-4 rounded-2xl border border-white/10 text-center">
                    <span className="text-[9px] text-cream/40 block uppercase tracking-wider font-semibold">{item.label}</span>
                    <span className={`text-2xl font-bold ${item.color} mt-1.5 font-display block`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Analytics Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Booking Analytics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Bookings', value: bookings.length, color: 'text-cream' },
                  { label: 'Confirmed Bookings', value: bookings.filter(b => b.status === 'confirmed').length, color: 'text-green-400' },
                  { label: 'Cancelled Bookings', value: bookings.filter(b => b.status === 'cancelled').length, color: 'text-red-400' },
                  { label: 'Pending Bookings', value: bookings.filter(b => b.status === 'pending').length, color: 'text-yellow-300' },
                ].map((item, idx) => (
                  <div key={idx} className="glass p-4 rounded-2xl border border-white/10 text-center">
                    <span className="text-[9px] text-cream/40 block uppercase tracking-wider font-semibold">{item.label}</span>
                    <span className={`text-2xl font-bold ${item.color} mt-1.5 font-display block`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CSV Data Reports & Exports */}
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                <Download className="w-5 h-5 text-gold" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Data Reports & Exports</h3>
                  <p className="text-[9px] text-cream/40 mt-0.5">Download database records directly as CSV spreadsheets</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={handleExportOrders}
                  className="btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer group hover:bg-gold hover:text-navy transition-all duration-300"
                >
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Export Orders CSV
                </button>

                <button
                  type="button"
                  onClick={handleExportCustomers}
                  className="btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer group hover:bg-gold hover:text-navy transition-all duration-300"
                >
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Export Customers CSV
                </button>

                <button
                  type="button"
                  onClick={handleExportRevenue}
                  className="btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer group hover:bg-gold hover:text-navy transition-all duration-300"
                >
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Export Revenue CSV
                </button>

                <button
                  type="button"
                  onClick={handleExportReviews}
                  className="btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer group hover:bg-gold hover:text-navy transition-all duration-300"
                >
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Export Reviews CSV
                </button>
              </div>
            </div>

            {/* Food Analytics Breakdown & Trend Chart */}
            <div className="grid md:grid-cols-12 gap-6">
              
              {/* Daily Sales Chart */}
              <div className="col-span-12 md:col-span-6 glass p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5">
                    Recent Revenue Trend
                  </h3>
                  <p className="text-[9px] text-cream/40 mt-1">Daily sales performance over the past week</p>
                </div>
                
                {/* CSS custom graphical representation based on real data */}
                {(() => {
                  const getLastSevenDaysSales = () => {
                    const sales = [];
                    for (let i = 6; i >= 0; i--) {
                      const d = new Date();
                      d.setDate(d.getDate() - i);
                      const dateStr = d.toISOString().split('T')[0];
                      const dayRev = completedOrders
                        .filter(o => o.date === dateStr)
                        .reduce((sum, o) => sum + o.total, 0);
                      sales.push({
                        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                        revenue: dayRev
                      });
                    }
                    return sales;
                  };
                  const lastSevenDaysSales = getLastSevenDaysSales();
                  const maxSales = Math.max(...lastSevenDaysSales.map(s => s.revenue), 1);

                  return (
                    <div className="h-32 flex items-end gap-3.5 pt-6 pb-2 px-2 justify-between border-b border-white/10">
                      {lastSevenDaysSales.map((val, idx) => {
                        const heightPercent = (val.revenue / maxSales) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                            <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity text-gold font-bold">₹{val.revenue.toFixed(0)}</span>
                            <div 
                              className="w-full bg-gradient-to-t from-sunset to-gold rounded-t-lg transition-all duration-500 hover:scale-x-105" 
                              style={{ height: `${Math.max(6, heightPercent)}%` }} 
                            />
                            <span className="text-[8px] text-cream/45 uppercase mt-1">{val.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Top Selling Categories */}
              <div className="col-span-12 md:col-span-6 glass p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5">
                  Most Ordered Categories
                </h3>
                {foodStats.popularCategories.length > 0 ? (
                  <div className="space-y-3.5">
                    {foodStats.popularCategories.map((cat, idx) => {
                      const totalQty = foodStats.popularCategories.reduce((sum, c) => sum + c.count, 0) || 1;
                      const percentage = (cat.count / totalQty) * 100;
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-cream/80 font-medium">{idx+1}. {cat.name}</span>
                            <span className="text-gold font-bold">{cat.count} units ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-sunset to-gold" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-cream/40 text-center py-12">No order logs found to analyze categories.</p>
                )}
              </div>

            </div>

            {/* Popular vs Low Performing Dishes */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Top Selling Dishes */}
              <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  Top Selling Dishes (Units Ordered)
                </h3>
                {foodStats.popularDishes.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {foodStats.popularDishes.map((dish, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 text-xs">
                        <span className="text-cream/90 font-medium">{idx + 1}. {dish.name}</span>
                        <span className="bg-sunset/15 px-3 py-1 rounded-full text-sunset font-bold text-[10px]">
                          {dish.count} units
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-cream/40 text-center py-12">No order logs found to analyze dishes.</p>
                )}
              </div>

              {/* Low Performing Dishes */}
              <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-gold" />
                  Low Performing Items
                </h3>
                <div className="divide-y divide-white/5">
                  {foodStats.lowPerformingDishes.map((dish, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 text-xs">
                      <span className="text-cream/80 font-medium">{idx + 1}. {dish.name}</span>
                      <span className="bg-white/5 px-2.5 py-1 rounded-full text-cream/40 text-[9px] font-semibold">
                        {dish.count} orders
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Highly Rated (Popular) Items List */}
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5 flex items-center gap-2">
                <Star className="w-4 h-4 text-gold fill-gold" />
                Highly Rated Dishes (Customer Favorites)
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {foodStats.highlyRatedItems.map((dish, idx) => (
                  <div key={idx} className="glass p-4 rounded-xl border border-white/5 space-y-2.5">
                    <img src={dish.image} alt={dish.name} className="w-full h-24 rounded-lg object-cover" />
                    <div>
                      <span className="text-[10px] text-cream/40 uppercase block">{dish.categoryName}</span>
                      <h4 className="font-semibold text-xs text-cream truncate" title={dish.name}>{dish.name}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] font-bold text-gold">₹{dish.price}</span>
                        <span className="flex items-center gap-0.5 text-gold text-[9px] font-bold">
                          <Star className="w-3 h-3 fill-gold" />
                          {dish.rating || '4.8'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS MANAGEMENT TAB */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="glass p-12 text-center text-cream/50 rounded-3xl">
                No orders placed yet. They will appear here when customers order food.
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="glass-card p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-cream text-lg">Order ID: {o.id}</h3>
                        <StatusBadge status={o.status} />
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-cream/60 capitalize font-medium">
                          {o.orderType}
                        </span>
                      </div>
                      
                      {/* Items */}
                      <div className="py-2 text-sm text-cream/80 space-y-1">
                        {o.items.map((item, idx) => (
                          <div key={idx}>
                            • {item.name} <span className="text-cream/40">x{item.quantity}</span> — ₹{item.price * item.quantity}
                          </div>
                        ))}
                      </div>

                      <p className="text-gold text-sm font-semibold">
                        Total Amount: ₹{o.total.toFixed(2)} · Payment: {o.paymentMethod}
                      </p>
                      {o.specialInstructions && o.specialInstructions !== 'None' && (
                        <p className="text-cream/50 text-xs italic">Instructions: &ldquo;{o.specialInstructions}&rdquo;</p>
                      )}
                      <p className="text-cream/35 text-[10px]">Submitted: {o.date}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="input-field py-2 text-sm w-auto cursor-pointer"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-navy capitalize">
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => deleteOrder(o.id)}
                        className="p-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors cursor-pointer"
                        aria-label="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CUSTOMERS MANAGEMENT TAB */}
        {/* CUSTOMERS MANAGEMENT TAB */}
        {tab === 'customers' && (
          <div className="space-y-6">
            
            {/* Customer Analytics Cards */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="glass p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-cream/50 text-[10px] uppercase tracking-wider block font-semibold">Total Directory</span>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-bold font-display text-gold">{customers.length}</span>
                    <span className="text-[10px] text-cream/40 block">Registered Customers</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-400 font-display">
                      {customers.filter(c => (c.orders || []).length > 0).length}
                    </span>
                    <span className="text-[9px] text-cream/40 block">Active Buyers</span>
                  </div>
                </div>
              </div>

              {/* Top Customers Summary */}
              <div className="glass p-5 rounded-2xl border border-white/10 space-y-2.5 text-xs">
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">Top Spenders</span>
                {custAnalytics.topCustomersBySpend.length > 0 ? (
                  <div className="space-y-1.5">
                    {custAnalytics.topCustomersBySpend.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-center text-cream/80">
                        <span className="truncate max-w-[120px] font-medium">{idx+1}. {c.name}</span>
                        <span className="text-gold font-bold">₹{c.totalSpent.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-cream/40">No spending logs found.</p>
                )}
              </div>

              {/* Most Active Customers / Month summary */}
              <div className="glass p-5 rounded-2xl border border-white/10 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Most Active Customers</span>
                  <span className="text-[9px] bg-sunset/15 px-2 py-0.5 rounded text-sunset font-bold">New: {custAnalytics.newCustomersThisMonth}</span>
                </div>
                {custAnalytics.mostActiveCustomers.length > 0 ? (
                  <div className="space-y-1.5">
                    {custAnalytics.mostActiveCustomers.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-center text-cream/80">
                        <span className="truncate max-w-[120px] font-medium">{idx+1}. {c.name}</span>
                        <span className="text-sunset font-bold">{c.orderCount} orders</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-cream/40">No order logs found.</p>
                )}
              </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gold" />
                Filter Customer Directory
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[9px] text-cream/50 mb-1 uppercase tracking-wider font-semibold">Search by Name</label>
                  <input
                    type="text"
                    value={customerSearchName}
                    onChange={(e) => setCustomerSearchName(e.target.value)}
                    placeholder="e.g. Rohan"
                    className="input-field py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-cream/50 mb-1 uppercase tracking-wider font-semibold">Search by Email</label>
                  <input
                    type="text"
                    value={customerSearchEmail}
                    onChange={(e) => setCustomerSearchEmail(e.target.value)}
                    placeholder="e.g. rohan@example.com"
                    className="input-field py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-cream/50 mb-1 uppercase tracking-wider font-semibold">Filter by Total Orders</label>
                  <input
                    type="number"
                    value={customerMinOrders}
                    onChange={(e) => setCustomerMinOrders(e.target.value)}
                    placeholder="e.g. 1"
                    className="input-field py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-cream/50 mb-1 uppercase tracking-wider font-semibold">Filter by Total Spend (₹)</label>
                  <input
                    type="number"
                    value={customerMinSpend}
                    onChange={(e) => setCustomerMinSpend(e.target.value)}
                    placeholder="e.g. 100"
                    className="input-field py-2 text-xs font-medium"
                  />
                </div>
              </div>
              
              {(customerSearchName || customerSearchEmail || customerMinOrders || customerMinSpend) && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setCustomerSearchName('');
                      setCustomerSearchEmail('');
                      setCustomerMinOrders('');
                      setCustomerMinSpend('');
                    }}
                    className="text-[10px] text-sunset hover:text-gold transition-colors font-bold flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Customer List Table */}
            <div className="glass p-6 rounded-3xl border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gold">
                  Directory Entries ({filteredCustomers.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-cream/80 divide-y divide-white/10">
                  <thead>
                    <tr className="text-[10px] text-cream/40 uppercase tracking-wider">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Total Spend</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCustomers.map((cust, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-cream flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${idx === 0 && cust.totalSpent > 0 ? 'bg-gold animate-pulse' : 'bg-transparent'}`} title={idx === 0 ? 'Top Spender' : ''} />
                          {cust.name}
                        </td>
                        <td className="py-3.5 px-4 text-cream/80">{cust.email}</td>
                        <td className="py-3.5 px-4 text-cream/60">{cust.phone}</td>
                        <td className="py-3.5 px-4 text-cream/60">{cust.regDate}</td>
                        <td className="py-3.5 px-4 font-bold">{cust.orderCount} orders</td>
                        <td className="py-3.5 px-4 font-bold text-gold">₹{cust.totalSpent.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedCustomer(cust)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-sunset hover:text-navy text-cream font-semibold rounded-lg text-[10px] transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Selected Customer details drawer modal */}
            {selectedCustomer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div onClick={() => setSelectedCustomer(null)} className="absolute inset-0 bg-navy-dark/85 backdrop-blur-md" />
                <div className="relative w-full max-w-lg glass-strong rounded-3xl border border-white/20 p-6 max-h-[85vh] overflow-y-auto no-scrollbar space-y-6">
                  <button onClick={() => setSelectedCustomer(null)} className="absolute top-4 right-4 p-2 rounded-full bg-navy border border-white/10 hover:bg-sunset text-cream hover:text-navy cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    <h3 className="font-display text-gradient text-xl font-bold">{selectedCustomer.name}</h3>
                    <p className="text-xs text-cream/50 mt-1">Customer Profile & Business Insights</p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass p-3 rounded-xl border border-white/5 text-center">
                      <span className="text-[8px] text-cream/40 uppercase block">Total Spent</span>
                      <span className="text-sm font-bold text-gold mt-1 block">₹{selectedCustomer.totalSpent.toFixed(0)}</span>
                    </div>
                    <div className="glass p-3 rounded-xl border border-white/5 text-center">
                      <span className="text-[8px] text-cream/40 uppercase block">Total Orders</span>
                      <span className="text-sm font-bold text-sunset mt-1 block">{selectedCustomer.orderCount}</span>
                    </div>
                    <div className="glass p-3 rounded-xl border border-white/5 text-center">
                      <span className="text-[8px] text-cream/40 uppercase block">Last Active</span>
                      <span className="text-[10px] font-bold text-cream mt-1.5 block truncate">{selectedCustomer.lastOrderDate}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <h4 className="text-[10px] font-bold text-gold uppercase tracking-wider">Contact Profile</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><span className="text-cream/40 uppercase tracking-wider text-[8px] block">Email</span><span className="font-semibold text-cream">{selectedCustomer.email}</span></div>
                      <div><span className="text-cream/40 uppercase tracking-wider text-[8px] block">Phone</span><span className="font-semibold text-cream">{selectedCustomer.phone}</span></div>
                    </div>
                    <div className="pt-1"><span className="text-cream/40 uppercase tracking-wider text-[8px] block font-medium">Registration Date</span><span className="font-semibold text-cream">{selectedCustomer.regDate}</span></div>
                    <div className="pt-1"><span className="text-cream/40 uppercase tracking-wider text-[8px] block font-medium">Default Delivery Address</span><p className="text-cream/80 mt-0.5 leading-relaxed">{selectedCustomer.address}</p></div>
                  </div>

                  {/* Customer saved addresses */}
                  {selectedCustomer.savedAddresses && selectedCustomer.savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-gold uppercase tracking-wider">Saved Addresses ({selectedCustomer.savedAddresses.length})</h4>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {selectedCustomer.savedAddresses.map((addr, idx) => (
                          <div key={idx} className="glass p-3 rounded-xl border border-white/5">
                            <span className="font-bold text-sunset block uppercase">{addr.label}</span>
                            <p className="text-cream/70 mt-1 leading-snug">{addr.address}, {addr.city}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Favourite dishes */}
                  {selectedCustomer.favouriteDishes && selectedCustomer.favouriteDishes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-gold uppercase tracking-wider">Favourite Dishes</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer.favouriteDishes.map((dishName, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-cream/80 text-[10px] font-semibold">
                            ❤️ {dishName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer order logs */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gold uppercase tracking-wider">Past Order Logs ({selectedCustomer.orders?.length || 0})</h4>
                    
                    <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar">
                      {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                        selectedCustomer.orders.map((o, idx) => (
                          <div key={idx} className="glass p-3 rounded-xl border border-white/5 space-y-2 text-[11px]">
                            <div className="flex justify-between font-mono">
                              <span className="text-gold font-bold">{o.id}</span>
                              <span className="text-cream/40">{o.date}</span>
                            </div>
                            <div className="text-[10px] text-cream/70 space-y-0.5">
                              {o.items.map((i, sIdx) => (
                                <div key={sIdx}>• {i.name} x{i.quantity}</div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-1.5 border-t border-white/5 text-[10px]">
                              <span className="font-bold text-cream">Total Paid: ₹{o.total.toFixed(0)}</span>
                              <span className={`font-semibold ${o.status === 'Delivered' ? 'text-green-400' : 'text-yellow-300'}`}>{o.status}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-cream/40">No orders logged.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COUPON SYSTEM MANAGEMENT TAB */}
        {tab === 'coupons' && (() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const usages = JSON.parse(localStorage.getItem('rb_coupon_usage') || '{}');
          
          const totalCouponsCount = coupons.length;
          const activeCouponsCount = coupons.filter(c => {
            const isActive = c.active !== undefined ? c.active : (c.status === 'active');
            return isActive;
          }).length;
          const expiredCouponsCount = coupons.filter(c => c.expiryDate && todayStr > c.expiryDate).length;
          
          let mostUsedCouponCode = 'N/A';
          let maxUsages = 0;
          
          // Combine DB usageCount and local usages
          coupons.forEach(c => {
            const count = Math.max(c.usageCount || 0, usages[c.code] || 0);
            if (count > maxUsages) {
              maxUsages = count;
              mostUsedCouponCode = c.code;
            }
          });
          
          Object.keys(usages).forEach(code => {
            if (usages[code] > maxUsages) {
              const exists = coupons.some(c => c.code === code);
              if (!exists) {
                maxUsages = usages[code];
                mostUsedCouponCode = code;
              }
            }
          });

          const mostUsedCouponText = maxUsages > 0 ? `${mostUsedCouponCode} (${maxUsages} uses)` : 'N/A';
          const totalDiscountGiven = orders.reduce((sum, o) => sum + (o.discount || 0), 0);

          const handleSubmitCouponForm = (e) => {
            if (isEditingCoupon) {
              handleSaveEditCoupon(e);
            } else {
              handleCreateCoupon(e);
            }
          };

          return (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Coupon Analytics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Total Coupons', value: totalCouponsCount, color: 'text-cream' },
                  { label: 'Active Coupons', value: activeCouponsCount, color: 'text-green-400' },
                  { label: 'Expired Coupons', value: expiredCouponsCount, color: 'text-pink' },
                  { label: 'Most Used Coupon', value: mostUsedCouponText, color: 'text-gold' },
                  { label: 'Total Discount', value: `₹${totalDiscountGiven.toFixed(0)}`, color: 'text-sunset' }
                ].map((stat, idx) => (
                  <div key={idx} className="glass p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <span className="text-[9px] text-cream/40 block uppercase tracking-wider font-semibold">{stat.label}</span>
                    <span className={`text-base sm:text-lg font-bold ${stat.color} mt-1.5 font-display block truncate`}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-12 gap-8 items-start">
                
                {/* Create/Edit Coupon Form */}
                <form onSubmit={handleSubmitCouponForm} className="col-span-12 md:col-span-4 glass p-6 rounded-3xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5 flex justify-between items-center">
                    <span>{isEditingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</span>
                    {isEditingCoupon && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingCoupon(false);
                          setEditingCouponCode('');
                          setNewCouponCode('');
                          setNewCouponValue(15);
                          setNewCouponMinSpend(299);
                          setNewCouponMaxDiscount(100);
                          setNewCouponExpiryDate('2027-12-31');
                          setNewCouponUsageLimit(50);
                          setNewCouponStatus('active');
                          setNewCouponDesc('');
                        }}
                        className="text-[10px] text-pink hover:text-gold transition-colors bg-transparent border-0 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </h3>

                  <div>
                    <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider font-medium font-medium">Coupon Code</label>
                    <input
                      type="text"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      placeholder="e.g. TASTY15"
                      className="input-field py-2.5 text-xs uppercase"
                      disabled={isEditingCoupon}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider font-medium">Discount Type</label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value)}
                        className="input-field py-2 text-xs cursor-pointer font-medium"
                      >
                        <option value="percentage" className="bg-navy">Percentage %</option>
                        <option value="flat" className="bg-navy">Flat Discount ₹</option>
                        <option value="gift" className="bg-navy">Free Dessert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider font-medium">Discount Value</label>
                      <input
                        type="number"
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(e.target.value)}
                        className="input-field py-2.5 text-xs"
                        disabled={newCouponType === 'gift'}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider font-medium font-medium">Min Spend (₹)</label>
                      <input
                        type="number"
                        value={newCouponMinSpend}
                        onChange={(e) => setNewCouponMinSpend(e.target.value)}
                        className="input-field py-2.5 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider font-medium font-medium">Max Discount (₹)</label>
                      <input
                        type="number"
                        value={newCouponMaxDiscount}
                        onChange={(e) => setNewCouponMaxDiscount(e.target.value)}
                        className="input-field py-2.5 text-xs"
                        disabled={newCouponType !== 'percentage'}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider font-medium">Expiry Date</label>
                      <input
                        type="date"
                        value={newCouponExpiryDate}
                        onChange={(e) => setNewCouponExpiryDate(e.target.value)}
                        className="input-field py-2.5 text-xs text-cream/80"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider font-medium">Usage Limit</label>
                      <input
                        type="number"
                        value={newCouponUsageLimit}
                        onChange={(e) => setNewCouponUsageLimit(e.target.value)}
                        className="input-field py-2.5 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider">Status</label>
                    <select
                      value={newCouponStatus}
                      onChange={(e) => setNewCouponStatus(e.target.value)}
                      className="input-field py-2 text-xs cursor-pointer font-medium"
                    >
                      <option value="active" className="bg-navy">Active</option>
                      <option value="inactive" className="bg-navy">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider">Custom Description (Optional)</label>
                    <textarea
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      placeholder="e.g. Get 15% off up to ₹100 on starters"
                      className="input-field py-2 text-xs h-16 resize-none font-medium"
                    />
                  </div>

                  <button type="submit" className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                    {isEditingCoupon ? 'Save Coupon Changes' : 'Create Coupon'}
                  </button>
                </form>

                {/* Coupons Directory List */}
                <div className="col-span-12 md:col-span-8 glass p-6 rounded-3xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5">
                    Coupons Directory List
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {coupons.map((c, idx) => {
                      const currentUsages = Math.max(c.usageCount || 0, usages[c.code] || 0);
                      const isExpired = c.expiryDate && todayStr > c.expiryDate;
                      const isActive = c.active !== undefined ? c.active : (c.status === 'active');
                      const cStatus = isActive ? 'active' : 'inactive';
                      const descriptionText = c.description || c.desc;

                      return (
                        <div key={idx} className="glass p-4 rounded-2xl border border-white/5 flex flex-col justify-between gap-4 font-medium text-xs">
                          <div>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-xl bg-sunset/15 text-sunset font-mono text-xs font-bold uppercase tracking-wider">
                                  {c.code}
                                </span>
                                
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                  cStatus === 'inactive' 
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                    : isExpired
                                      ? 'bg-pink-500/10 text-pink border-pink-500/20'
                                      : 'bg-green-500/10 text-green-400 border-green-500/20'
                                }`}>
                                  {cStatus === 'inactive' ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                                </span>
                              </div>
                              
                              <div className="flex gap-1 items-center">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditCoupon(c)}
                                  className="p-1.5 rounded-lg text-cream/40 hover:text-gold transition-colors cursor-pointer bg-transparent border-0"
                                  title="Edit Coupon"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleToggleCouponStatus(c.code)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer bg-transparent border-0 ${
                                    cStatus === 'active' ? 'text-green-400 hover:text-green-300' : 'text-cream/30 hover:text-green-400'
                                  }`}
                                  title={cStatus === 'active' ? 'Deactivate Coupon' : 'Activate Coupon'}
                                >
                                  {cStatus === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteCoupon(c.code)}
                                  className="p-1.5 rounded-lg text-cream/30 hover:text-pink transition-colors cursor-pointer bg-transparent border-0"
                                  title="Delete Coupon"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-cream mt-3 font-semibold">{descriptionText}</p>
                            
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-cream/50 mt-3 pt-2 border-t border-white/5">
                              <div>
                                <span className="block text-[8px] text-cream/30 uppercase">Min Spend</span>
                                <span className="font-semibold text-cream/80">₹{c.minimumOrderAmount !== undefined ? c.minimumOrderAmount : (c.minSpend || 0)}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-cream/30 uppercase">Max Discount</span>
                                <span className="font-semibold text-cream/80">
                                  {(c.maximumDiscount !== undefined ? c.maximumDiscount : c.maxDiscount) > 0 
                                    ? `₹${c.maximumDiscount !== undefined ? c.maximumDiscount : c.maxDiscount}` 
                                    : 'No Cap'}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-cream/30 uppercase">Expiry Date</span>
                                <span className={`font-semibold ${isExpired ? 'text-pink' : 'text-cream/80'}`}>{c.expiryDate || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-cream/30 uppercase">Usage Limit</span>
                                <span className="font-semibold text-cream/80">{currentUsages} / {c.usageLimit || 50} uses</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

        {/* CUSTOMER REVIEWS TAB */}
        {tab === 'reviews' && (() => {
          // Review Analytics calculations
          const getReviewAnalytics = () => {
            const dishCounts = {};
            const dishSums = {};

            reviews.forEach(rev => {
              const items = rev.items || [];
              items.forEach(name => {
                dishCounts[name] = (dishCounts[name] || 0) + 1;
                dishSums[name] = (dishSums[name] || 0) + rev.rating;
              });
            });

            const mostReviewed = Object.keys(dishCounts)
              .map(name => ({
                name,
                count: dishCounts[name],
                avgRating: dishSums[name] / dishCounts[name]
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 3);

            const highestRated = Object.keys(dishCounts)
              .map(name => ({
                name,
                count: dishCounts[name],
                avgRating: dishSums[name] / dishCounts[name]
              }))
              .filter(item => item.avgRating >= 4.0)
              .sort((a, b) => b.avgRating - a.avgRating || b.count - a.count)
              .slice(0, 3);

            return { mostReviewed, highestRated };
          };

          const reviewAnal = getReviewAnalytics();

          // Filtering
          const filteredReviews = reviews.filter(rev => {
            // Treat undefined status as approved to preserve mock data backwards compatibility
            const statusVal = rev.status || 'approved';
            const matchesStatus = reviewStatusFilter === 'all' || statusVal === reviewStatusFilter;
            const matchesRating = reviewRatingFilter === 'all' || rev.rating === Number(reviewRatingFilter);
            return matchesStatus && matchesRating;
          });

          return (
            <div className="space-y-6">
              
              {/* Reviews summary analytics */}
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="glass p-5 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center">
                  <span className="text-cream/50 text-[10px] uppercase tracking-wider block">Average Rating</span>
                  <span className="text-4xl font-bold font-display text-gold mt-1 flex items-center gap-1.5">
                    <Star className="w-8 h-8 text-gold fill-gold" />
                    {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                  </span>
                  <span className="text-[10px] text-cream/35 mt-1">based on {reviews.length} reviews</span>
                </div>

                <div className="glass p-5 rounded-2xl border border-white/5 col-span-2 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider block mb-1">Ratings Breakdown</span>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter(r => r.rating === stars).length;
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-cream/60">
                        <span className="w-3 text-right">{stars}★</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-sunset to-gold" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-8 text-right font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Analytics: Most Reviewed & Highest Rated Dishes */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Most Reviewed Dishes */}
                <div className="glass p-5 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold pb-1.5 border-b border-white/5 flex items-center gap-2">
                    Most Reviewed Dishes
                  </h4>
                  {reviewAnal.mostReviewed.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {reviewAnal.mostReviewed.map((dish, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 text-xs">
                          <span className="text-cream/90 font-medium">{dish.name}</span>
                          <span className="bg-sunset/15 px-2.5 py-0.5 rounded-full text-sunset font-bold text-[9px]">
                            {dish.count} reviews (★{dish.avgRating.toFixed(1)})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-cream/40 py-6 text-center">No reviews logged for dishes.</p>
                  )}
                </div>

                {/* Highest Rated Dishes */}
                <div className="glass p-5 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold pb-1.5 border-b border-white/5 flex items-center gap-2">
                    Highest Rated Dishes
                  </h4>
                  {reviewAnal.highestRated.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {reviewAnal.highestRated.map((dish, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 text-xs">
                          <span className="text-cream/90 font-medium">{dish.name}</span>
                          <span className="bg-green-500/10 px-2.5 py-0.5 rounded-full text-green-300 font-bold text-[9px]">
                            ★{dish.avgRating.toFixed(1)} ({dish.count} ratings)
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-cream/40 py-6 text-center">No highly rated dishes found yet.</p>
                  )}
                </div>

              </div>

              {/* Review Filters & Search */}
              <div className="glass p-6 rounded-3xl border border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5 flex items-center gap-2 mb-4">
                  Filter & Moderation Queue
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] text-cream/50 mb-1 uppercase tracking-wider font-semibold">Filter by Status</label>
                    <select
                      value={reviewStatusFilter}
                      onChange={(e) => setReviewStatusFilter(e.target.value)}
                      className="input-field py-2 text-xs cursor-pointer font-medium"
                    >
                      <option value="all" className="bg-navy">All Reviews</option>
                      <option value="pending" className="bg-navy">Pending Moderation</option>
                      <option value="approved" className="bg-navy">Approved Reviews</option>
                      <option value="rejected" className="bg-navy">Rejected Reviews</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-cream/50 mb-1 uppercase tracking-wider font-semibold">Filter by Rating</label>
                    <select
                      value={reviewRatingFilter}
                      onChange={(e) => setReviewRatingFilter(e.target.value)}
                      className="input-field py-2 text-xs cursor-pointer font-medium"
                    >
                      <option value="all" className="bg-navy">All Star Ratings</option>
                      <option value="5" className="bg-navy">5 ★★★★★</option>
                      <option value="4" className="bg-navy">4 ★★★★</option>
                      <option value="3" className="bg-navy">3 ★★★</option>
                      <option value="2" className="bg-navy">2 ★★</option>
                      <option value="1" className="bg-navy">1 ★</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer reviews log */}
              <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gold">
                    Reviews List ({filteredReviews.length})
                  </h3>
                  {(reviewStatusFilter !== 'all' || reviewRatingFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setReviewStatusFilter('all');
                        setReviewRatingFilter('all');
                      }}
                      className="text-[10px] text-sunset hover:text-gold transition-colors font-bold bg-transparent border-0 cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((rev) => (
                      <div key={rev.id} className="glass p-5 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h4 className="font-semibold text-cream text-xs">{rev.customerName}</h4>
                              
                              {/* Status Badge */}
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                (rev.status || 'approved') === 'rejected' 
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                  : (rev.status || 'approved') === 'approved'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
                              }`}>
                                {rev.status || 'approved'}
                              </span>
                            </div>
                            <span className="text-[9px] text-cream/40">{rev.customerEmail} · Order {rev.orderId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex text-gold">
                              {Array.from({ length: rev.rating }).map((_, idx) => (
                                <Star key={idx} className="w-3.5 h-3.5 fill-gold" />
                              ))}
                            </span>
                            <span className="text-[9px] text-cream/35">{rev.date}</span>
                          </div>
                        </div>

                        <p className="text-xs text-cream/80 leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[10px]">
                          <span className="text-cream/40">Reviewed items: {rev.items?.join(', ')}</span>
                          
                          <div className="flex gap-2 items-center">
                            
                            {/* Moderation Buttons */}
                            {(rev.status || 'approved') !== 'approved' && (
                              <button
                                onClick={() => handleApproveReview(rev.id)}
                                className="px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 font-bold rounded text-[9px] transition-all cursor-pointer"
                              >
                                Approve
                              </button>
                            )}

                            {(rev.status || 'approved') !== 'rejected' && (
                              <button
                                onClick={() => handleRejectReview(rev.id)}
                                className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-bold rounded text-[9px] transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            )}

                            {/* Featured Button */}
                            <button
                              onClick={() => handleToggleFeaturedReview(rev.id)}
                              className={`px-2.5 py-1 rounded border text-[9px] font-bold transition-all cursor-pointer bg-transparent ${
                                rev.featured 
                                  ? 'border-gold bg-gold/10 text-gold' 
                                  : 'border-white/10 text-cream/40 hover:border-gold hover:text-gold'
                              }`}
                            >
                              {rev.featured ? 'Featured ★' : 'Feature'}
                            </button>
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1 hover:text-pink text-cream/30 transition-colors cursor-pointer bg-transparent border-0"
                              title="Delete review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-cream/40 text-center py-8">No customer reviews found matching filter criteria.</p>
                  )}
                </div>
              </div>

            </div>
          );
        })()}

        {/* MENU MANAGEMENT TAB */}
        {tab === 'menu' && (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* Add/Edit Dish Form */}
            <form onSubmit={isEditingDish ? handleSaveEditDish : handleAddDish} className="col-span-12 md:col-span-4 glass p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5">
                {isEditingDish ? 'Edit Dish Details' : 'Add New Dish'}
              </h3>

              {!isEditingDish && (
                <div>
                  <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider">Select Category</label>
                  <select
                    value={selectedAddCatId}
                    onChange={(e) => setSelectedAddCatId(e.target.value)}
                    className="input-field py-2 text-xs cursor-pointer font-medium"
                    required
                  >
                    <option value="" className="bg-navy">-- Select Category --</option>
                    {menuCategories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-navy">{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider font-medium font-medium">Dish Name</label>
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g. Butter Naan"
                  className="input-field py-2.5 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider font-medium">Price (₹)</label>
                  <input
                    type="number"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    className="input-field py-2.5 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider">Image Path</label>
                  <input
                    type="text"
                    value={dishImage}
                    onChange={(e) => setDishImage(e.target.value)}
                    className="input-field py-2.5 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider">Dish Tag (Optional)</label>
                <input
                  type="text"
                  value={dishTag}
                  onChange={(e) => setDishTag(e.target.value)}
                  placeholder="e.g. Bestseller, Chef Special"
                  className="input-field py-2.5 text-xs font-medium"
                />
                <div className="flex flex-wrap gap-2 mt-1.5 text-[9px]">
                  {['Bestseller', 'Chef Special', 'Recommended'].map(tagOption => (
                    <button
                      key={tagOption}
                      type="button"
                      onClick={() => setDishTag(tagOption)}
                      className={`px-2.5 py-1.5 border rounded-lg transition-all cursor-pointer bg-transparent ${
                        dishTag === tagOption 
                          ? 'border-sunset text-sunset font-bold bg-sunset/5' 
                          : 'border-white/10 text-cream/50 hover:text-cream hover:border-white/20'
                      }`}
                    >
                      {tagOption}
                    </button>
                  ))}
                  {dishTag && (
                    <button
                      type="button"
                      onClick={() => setDishTag('')}
                      className="px-2.5 py-1.5 border border-red-500/25 text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer bg-transparent"
                    >
                      Clear Tag
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider">Description</label>
                <textarea
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  className="input-field py-2 text-xs h-16 resize-none"
                  placeholder="Describe flavors and richness of this dish..."
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-2.5 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDishIsVeg(!dishIsVeg)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold cursor-pointer ${
                    dishIsVeg 
                      ? 'border-green-600 bg-green-600/10 text-green-400' 
                      : 'border-red-600 bg-red-600/10 text-red-400'
                  }`}
                >
                  {dishIsVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                </button>

                <button
                  type="button"
                  onClick={() => setDishAvailable(!dishAvailable)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold cursor-pointer ${
                    dishAvailable 
                      ? 'border-green-500 bg-green-500/10 text-green-400' 
                      : 'border-white/10 glass text-cream/40'
                  }`}
                >
                  {dishAvailable ? '✔️ Instock' : '❌ Out of Stock'}
                </button>

                <button
                  type="button"
                  onClick={() => setDishPopular(!dishPopular)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold cursor-pointer ${
                    dishPopular 
                      ? 'border-gold bg-gold/10 text-gold' 
                      : 'border-white/10 glass text-cream/40'
                  }`}
                >
                  {dishPopular ? '⭐ Popular' : '☆ Regular'}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                {isEditingDish && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingDish(false);
                      setDishName('');
                      setDishDesc('');
                      setDishPrice(199);
                      setDishTag('');
                      setDishPopular(false);
                    }}
                    className="flex-1 py-2.5 border border-white/10 glass rounded-xl text-xs font-semibold hover:bg-white/5 cursor-pointer text-cream"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                  {isEditingDish ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </form>

            {/* Menu List of items with availability toggle */}
            <div className="col-span-12 md:col-span-8 glass p-6 rounded-3xl border border-white/10 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold pb-2 border-b border-white/5">
                Signature Food Categories ({menuCategories.length})
              </h3>
              
              <div className="space-y-6">
                {menuCategories.map((cat) => (
                  <div key={cat.id} className="space-y-3">
                    <h4 className="text-xs font-bold text-sunset uppercase tracking-wider pl-1.5 border-l-2 border-sunset">
                      {cat.name} ({cat.items.length} items)
                    </h4>
                    
                    <div className="space-y-2.5">
                      {cat.items.map((item) => (
                        <div key={item.name} className="glass p-3.5 rounded-xl border border-white/5 flex items-center gap-4 justify-between">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${item.isVeg !== false ? 'bg-green-600' : 'bg-red-600'}`} />
                                <h5 className="font-semibold text-xs text-cream">{item.name}</h5>
                                {item.tag && <span className="px-2 py-0.5 bg-sunset/20 text-sunset text-[8px] font-bold uppercase rounded-md">{item.tag}</span>}
                              </div>
                              <p className="text-[10px] text-cream/40 leading-snug line-clamp-1 mt-0.5">{item.description}</p>
                              <span className="text-[10px] font-bold text-gold mt-1 block">₹{item.price}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Toggle Availability Switch */}
                            <button
                              onClick={() => handleToggleAvailability(cat.id, item.name)}
                              className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold cursor-pointer transition-all ${
                                item.available !== false 
                                  ? 'border-green-500 bg-green-500/10 text-green-400' 
                                  : 'border-red-500 bg-red-500/10 text-red-400'
                              }`}
                            >
                              {item.available !== false ? 'Instock' : 'Out of Stock'}
                            </button>

                            <button
                              onClick={() => handleStartEditDish(cat.id, item)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-cream/70 hover:text-gold cursor-pointer bg-transparent border-0"
                              title="Edit Item"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteDish(cat.id, item.name)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-cream/40 hover:text-pink cursor-pointer bg-transparent border-0"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* BOOKINGS TABLE TAB */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="glass p-12 text-center text-cream/50 rounded-3xl">
                No bookings yet. They will appear here when guests reserve tables.
              </div>
            ) : (
              bookings.map((b) => {
                const bookingId = b._id || b.id;
                return (
                  <div key={bookingId} className="glass-card p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-cream text-lg">{b.name}</h3>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-cream/60 text-sm">
                          {b.email} · {b.phone}
                        </p>
                        <p className="text-gold text-sm font-medium">
                          {b.date} at {b.time} · {b.guests} guests · {b.occasion}
                        </p>
                        {b.specialRequests && (
                          <p className="text-cream/50 text-sm italic">&ldquo;{b.specialRequests}&rdquo;</p>
                        )}
                        <p className="text-cream/35 text-[10px]">Submitted {formatDate(b.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={b.status}
                          onChange={(e) => updateBooking(bookingId, e.target.value)}
                          className="input-field py-2 text-sm w-auto cursor-pointer"
                        >
                          {BOOKING_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-navy capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => deleteBooking(bookingId)}
                          className="p-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors cursor-pointer"
                          aria-label="Delete booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* INQUIRIES TABLE TAB */}
        {tab === 'inquiries' && (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="glass p-12 text-center text-cream/50 rounded-3xl">
                No inquiries yet. They will appear here when guests submit order requests.
              </div>
            ) : (
              inquiries.map((inq) => (
                <div key={inq._id} className="glass-card p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-cream text-lg">{inq.name}</h3>
                        <StatusBadge status={inq.status} />
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-cream/60 capitalize font-medium">
                          {inq.orderType}
                        </span>
                      </div>
                      <p className="text-cream/60 text-sm">
                        {inq.email}
                        {inq.phone ? ` · ${inq.phone}` : ''}
                      </p>
                      <p className="text-cream/80 text-sm mt-2">{inq.items}</p>
                      {inq.message && (
                        <p className="text-cream/50 text-sm italic">&ldquo;{inq.message}&rdquo;</p>
                      )}
                      <p className="text-cream/35 text-[10px]">Submitted {formatDate(inq.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={inq.status}
                        onChange={(e) => updateInquiry(inq._id, e.target.value)}
                        className="input-field py-2 text-sm w-auto cursor-pointer"
                      >
                        {INQUIRY_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-navy capitalize">
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => deleteInquiry(inq._id)}
                        className="p-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors cursor-pointer"
                        aria-label="Delete inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  );
}
