import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  User, History, MapPin, Heart, Edit3, Plus, Trash2, ShoppingBag, 
  LogOut, Check, AlertCircle, ArrowRight, RotateCcw, Star, PlusCircle, Compass,
  Calendar
} from 'lucide-react';
import { api } from '../api/api';
import { showConfirm, showSuccess, showError } from '../utils/toast';
// Helper components
const VegIndicator = ({ isVeg }) => (
  <span 
    className={`inline-flex items-center justify-center w-3 h-3 border border-2 rounded shrink-0 bg-white/5 ${
      isVeg ? 'border-green-600 bg-green-600/5' : 'border-red-600 bg-red-600/5'
    }`}
  >
    {isVeg ? (
      <span className="w-1 h-1 rounded-full bg-green-600" />
    ) : (
      <svg className="w-1 h-1 fill-red-600" viewBox="0 0 100 100">
        <polygon points="50,15 90,85 10,85" />
      </svg>
    )}
  </span>
);

export default function DashboardPage({ currentUser, onUpdateProfile, onLogout, onReorder, onAddToCart, menuCategories }) {
  const navigate = useNavigate();

  // Helper to look up dish details from the menuCategories database by name
  const getDishDetails = (name) => {
    for (const cat of menuCategories || []) {
      const dish = cat.items.find(item => item.name === name);
      if (dish) return { ...dish, categoryId: cat.id };
    }
    return null;
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Review & Rating State
  const [activeReviewOrderId, setActiveReviewOrderId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('rb_sound_enabled') !== 'false';
  });

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addressContent, setAddressContent] = useState('');
  const [addressLandmark, setAddressLandmark] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressPincode, setAddressPincode] = useState('');

  const [ordersList, setOrdersList] = useState(() => currentUser ? (currentUser.orders || []) : []);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Fetch orders from MongoDB with local fallback
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      setLoadingOrders(true);
      setOrdersError('');
      try {
        const res = await api.getOrders();
        if (res.success) {
          setOrdersList(res.data || []);
          // Sync to localStorage
          const updatedUser = { ...currentUser, orders: res.data || [] };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const updatedUsers = users.map(u => 
            u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u
          );
          localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        }
      } catch (err) {
        console.warn('Failed to fetch orders from MongoDB, falling back to localStorage:', err.message);
        setOrdersList(currentUser.orders || []);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const [bookingsList, setBookingsList] = useState([]);
  const [roomBookingsList, setRoomBookingsList] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState('');

  // Fetch room bookings from MongoDB with local fallback
  useEffect(() => {
    const fetchRoomBookings = async () => {
      if (!currentUser) return;
      try {
        const res = await api.getMyRoomBookings();
        if (res.success) {
          setRoomBookingsList(res.data || []);
        }
      } catch (err) {
        console.warn('Failed to fetch room bookings from MongoDB, falling back to localStorage:', err.message);
        const localRoomBookings = JSON.parse(localStorage.getItem('rb_room_bookings') || '[]');
        const userRoomBookings = localRoomBookings.filter(
          b => b.email && b.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        setRoomBookingsList(userRoomBookings);
      }
    };

    fetchRoomBookings();
  }, [currentUser]);

  // Fetch bookings from MongoDB with local fallback
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      setLoadingBookings(true);
      setBookingsError('');
      try {
        const res = await api.getBookings();
        if (res.success) {
          setBookingsList(res.data || []);
        }
      } catch (err) {
        console.warn('Failed to fetch bookings from MongoDB, falling back to localStorage:', err.message);
        const localBookings = JSON.parse(localStorage.getItem('rb_bookings') || '[]');
        const userBookings = localBookings.filter(
          b => b.email && b.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        setBookingsList(userBookings);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  const [userReviews, setUserReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const fetchUserReviews = async () => {
    if (!currentUser) return;
    setLoadingReviews(true);
    try {
      const res = await api.getReviews();
      if (res.success) {
        const filtered = (res.data || []).filter(
          r => r.customerEmail && r.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
        );
        setUserReviews(filtered);
      }
    } catch (err) {
      console.warn('Failed to fetch reviews from MongoDB, falling back to localStorage:', err.message);
      const localReviews = JSON.parse(localStorage.getItem('rb_reviews') || '[]');
      const filtered = localReviews.filter(
        r => r.customerEmail && r.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
      );
      setUserReviews(filtered);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchUserReviews();
  }, [currentUser]);

  // Local storage state syncing
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    setProfileName(currentUser.name || '');
    setProfilePhone(currentUser.phone || '');
    setAddresses(currentUser.savedAddresses || []);
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileName || !profilePhone) {
      setProfileError('Please fill in all fields.');
      showError('Validation error. Please fill in all fields.');
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: profileName,
      phone: profilePhone
    };

    // Update in localStorage
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = users.map(u => 
      u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u
    );
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    onUpdateProfile(updatedUser);
    setIsEditingProfile(false);
    setProfileSuccess('Profile details updated!');
    showSuccess('Profile details updated successfully!');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  // Saved Addresses Handlers
  const handleAddOrUpdateAddress = (e) => {
    e.preventDefault();
    if (!addressContent || !addressCity || !addressPincode) {
      showError('Validation error. Address details are required.');
      return;
    }

    let updatedAddresses;
    const isEditing = !!editingAddressId;
    if (editingAddressId) {
      // Edit existing
      updatedAddresses = addresses.map(addr => 
        addr.id === editingAddressId 
          ? { id: editingAddressId, label: addressLabel, address: addressContent, landmark: addressLandmark, city: addressCity, pincode: addressPincode } 
          : addr
      );
    } else {
      // Create new
      const newAddress = {
        id: `ADDR-${Date.now()}`,
        label: addressLabel,
        address: addressContent,
        landmark: addressLandmark,
        city: addressCity,
        pincode: addressPincode
      };
      updatedAddresses = [...addresses, newAddress];
    }

    const updatedUser = {
      ...currentUser,
      savedAddresses: updatedAddresses
    };

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = users.map(u => 
      u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u
    );
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    setAddresses(updatedAddresses);
    onUpdateProfile(updatedUser);
    showSuccess(isEditing ? 'Address updated successfully!' : 'Address added successfully!');
    
    // Reset form
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setAddressLabel('Home');
    setAddressContent('');
    setAddressLandmark('');
    setAddressCity('');
    setAddressPincode('');
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label);
    setAddressContent(addr.address);
    setAddressLandmark(addr.landmark || '');
    setAddressCity(addr.city);
    setAddressPincode(addr.pincode);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = (id) => {
    showConfirm('Are you sure you want to delete this address?', () => {
      const updatedAddresses = addresses.filter(addr => addr.id !== id);
      
      const updatedUser = {
        ...currentUser,
        savedAddresses: updatedAddresses
      };

      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = users.map(u => 
        u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      setAddresses(updatedAddresses);
      onUpdateProfile(updatedUser);
      showSuccess('Address deleted successfully!');
    });
  };

  // Toggle order as favourite
  const handleToggleFavouriteOrder = (orderId) => {
    const updatedOrders = (currentUser.orders || []).map(order => {
      if (order.id === orderId) {
        return { ...order, isFavourite: !order.isFavourite };
      }
      return order;
    });

    const updatedUser = {
      ...currentUser,
      orders: updatedOrders
    };

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = users.map(u => 
      u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u
    );
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    onUpdateProfile(updatedUser);
  };

  // Toggle dish as favourite
  const handleToggleFavouriteDish = (dishName) => {
    const currentFavourites = currentUser.favouriteDishes || [];
    let updatedFavourites;
    if (currentFavourites.includes(dishName)) {
      updatedFavourites = currentFavourites.filter(n => n !== dishName);
    } else {
      updatedFavourites = [...currentFavourites, dishName];
    }

    const updatedUser = {
      ...currentUser,
      favouriteDishes: updatedFavourites
    };

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = users.map(u => 
      u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u
    );
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    onUpdateProfile(updatedUser);
  };

  const handleSubmitReview = async (e, order) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const reviewPayload = {
      orderId: order.id,
      rating: reviewRating,
      comment: reviewComment.trim(),
      items: order.items.map(item => item.name),
      dishName: order.items[0]?.name || ''
    };

    try {
      const res = await api.createReview(reviewPayload);
      if (res.success) {
        console.log('Review successfully created in MongoDB');
      }
    } catch (apiError) {
      console.warn('MongoDB review creation failed, using localStorage fallback:', apiError.message);
      const newLocalReview = {
        id: `REV-${Date.now()}`,
        _id: `REV-${Date.now()}`,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        date: new Date().toISOString().split('T')[0],
        featured: false,
        status: 'pending',
        ...reviewPayload
      };
      const allReviews = JSON.parse(localStorage.getItem('rb_reviews') || '[]');
      localStorage.setItem('rb_reviews', JSON.stringify([newLocalReview, ...allReviews]));
    }

    const updatedOrders = ordersList.map(o => {
      if (o.id === order.id) {
        return { ...o, reviewed: true };
      }
      return o;
    });
    setOrdersList(updatedOrders);

    const updatedUser = {
      ...currentUser,
      orders: currentUser.orders.map(o => o.id === order.id ? { ...o, reviewed: true } : o)
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = users.map(u => 
      u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u
    );
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    const allOrders = JSON.parse(localStorage.getItem('rb_all_orders') || '[]');
    const updatedAllOrders = allOrders.map(o => o.id === order.id ? { ...o, reviewed: true } : o);
    localStorage.setItem('rb_all_orders', JSON.stringify(updatedAllOrders));

    // Notify administrator
    window.dispatchEvent(new CustomEvent('admin-new-review', { detail: reviewPayload }));
    try {
      const pendingAdminNotifs = JSON.parse(localStorage.getItem('rb_pending_admin_notifs') || '[]');
      pendingAdminNotifs.push({ type: 'review', name: currentUser.name, time: Date.now() });
      localStorage.setItem('rb_pending_admin_notifs', JSON.stringify(pendingAdminNotifs));
    } catch (e) {}

    onUpdateProfile(updatedUser);
    setActiveReviewOrderId(null);
    setReviewComment('');
    setReviewRating(5);
    fetchUserReviews();
    showSuccess('Review submitted successfully!');
  };

  const handleUpdateReview = async (e, id) => {
    e.preventDefault();
    if (!editComment.trim()) return;

    try {
      await api.updateReview(id, { comment: editComment.trim(), rating: editRating });
      console.log('Review successfully updated in MongoDB');
    } catch (apiError) {
      console.warn('MongoDB review update failed, using localStorage fallback:', apiError.message);
    }

    const localReviews = JSON.parse(localStorage.getItem('rb_reviews') || '[]');
    const updatedReviews = localReviews.map(r => 
      (r._id === id || r.id === id) ? { ...r, comment: editComment.trim(), rating: editRating, status: 'pending' } : r
    );
    localStorage.setItem('rb_reviews', JSON.stringify(updatedReviews));

    setEditingReviewId(null);
    setEditComment('');
    fetchUserReviews();
    showSuccess('Review updated successfully!');
  };

  const handleDeleteReview = (id) => {
    showConfirm('Delete this review permanently?', async () => {
      try {
        await api.deleteReview(id);
        console.log('Review successfully deleted from MongoDB');
      } catch (apiError) {
        console.warn('MongoDB review deletion failed, using localStorage fallback:', apiError.message);
      }

      const localReviews = JSON.parse(localStorage.getItem('rb_reviews') || '[]');
      const updatedReviews = localReviews.filter(r => r._id !== id && r.id !== id);
      localStorage.setItem('rb_reviews', JSON.stringify(updatedReviews));

      fetchUserReviews();
      showSuccess('Review deleted successfully!');
    });
  };

  const favouriteDishesList = currentUser.favouriteDishes || [];

  return (
    <div className="min-h-screen bg-navy text-cream pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner greeting */}
        <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset to-gold flex items-center justify-center text-navy font-bold text-2xl">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gradient">Hello, {currentUser.name}!</h1>
              <p className="text-xs text-cream/50 mt-1">Manage your profile, orders, addresses, and favorites</p>
            </div>
          </div>
          <button
            onClick={() => {
              onLogout();
              navigate('/');
            }}
            className="flex items-center gap-2 px-4 py-2 border border-pink-soft/20 bg-pink-soft/5 hover:bg-pink-soft/10 text-pink rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Dashboard layout */}
        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* Tabs Menu */}
          <div className="col-span-12 md:col-span-3 space-y-2.5">
            {[
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'orders', label: 'My Orders', icon: History },
              { id: 'bookings', label: 'My Bookings', icon: Calendar },
              { id: 'reviews', label: 'My Reviews', icon: Star },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              { id: 'favourites', label: 'Favourite Dishes', icon: Heart }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 cursor-pointer border-0 ${
                  activeTab === tab.id
                    ? 'bg-sunset text-white border-l-4 border-sunset-dark md:translate-x-1 shadow-md'
                    : 'glass text-cream/70 hover:bg-white/5 hover:text-cream'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-cream/40'}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panel */}
          <div className="col-span-12 md:col-span-9 glass-strong p-6 sm:p-8 rounded-3xl border border-white/20 min-h-[50vh]">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-cream">Profile Settings</h3>
                  <p className="text-xs text-cream/40 mt-0.5">Keep your details up to date for smooth ordering</p>
                </div>

                {profileSuccess && (
                  <div className="p-3 bg-green-500/20 border border-green-500/30 text-green-400 text-xs rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4" /> {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="p-3 bg-pink-soft/20 border border-pink-soft/30 text-pink text-xs rounded-xl">
                    {profileError}
                  </div>
                )}

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs text-cream/60 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="input-field py-2.5 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-cream/60 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="input-field py-2.5 text-sm"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 py-2.5 border border-white/10 glass rounded-xl text-xs font-semibold hover:bg-white/5 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-gradient-to-r from-sunset to-gold text-navy rounded-xl text-xs font-bold hover:opacity-90 cursor-pointer"
                      >
                        Save Details
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 max-w-md">
                    <div className="glass p-4 rounded-2xl flex items-start gap-4">
                      <User className="w-5 h-5 text-gold mt-0.5" />
                      <div>
                        <span className="text-[10px] text-cream/40 block uppercase tracking-wider">Full Name</span>
                        <span className="text-sm font-semibold text-cream">{currentUser.name}</span>
                      </div>
                    </div>

                    <div className="glass p-4 rounded-2xl flex items-start gap-4">
                      <History className="w-5 h-5 text-sunset mt-0.5" />
                      <div>
                        <span className="text-[10px] text-cream/40 block uppercase tracking-wider">Email Address</span>
                        <span className="text-sm font-semibold text-cream">{currentUser.email}</span>
                      </div>
                    </div>

                    <div className="glass p-4 rounded-2xl flex items-start gap-4">
                      <User className="w-5 h-5 text-gold mt-0.5" />
                      <div>
                        <span className="text-[10px] text-cream/40 block uppercase tracking-wider">Mobile Number</span>
                        <span className="text-sm font-semibold text-cream">{currentUser.phone}</span>
                      </div>
                    </div>

                    {/* Sound Preferences */}
                    <div className="glass p-4 rounded-2xl border border-white/5 space-y-3 mt-4 select-none">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-cream/70">Notification Sound</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={soundEnabled}
                            onChange={(e) => {
                              const enabled = e.target.checked;
                              setSoundEnabled(enabled);
                              localStorage.setItem('rb_sound_enabled', enabled ? 'true' : 'false');
                            }}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cream after:border-white/30 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sunset"></div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 hover:border-sunset/35 text-xs text-cream font-semibold bg-white/5 hover:bg-white/10 transition-all cursor-pointer mt-2"
                    >
                      <Edit3 className="w-4 h-4 text-gold" />
                      Edit Profile Info
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-cream">Order History</h3>
                  <p className="text-xs text-cream/40 mt-0.5">Track your orders and repeat your favorite feasts</p>
                </div>

                {ordersList.length > 0 ? (
                  <div className="space-y-4">
                    {ordersList.map(order => (
                      <div key={order.id} className="glass p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col gap-4">
                        {/* ID, Date, Status */}
                        <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-cream/40 block">ORDER ID</span>
                            <span className="text-sm font-mono font-bold text-gold">{order.id}</span>
                            
                            {/* Toggle Favourite Order */}
                            <button
                              onClick={() => handleToggleFavouriteOrder(order.id)}
                              className="p-1 text-cream/35 hover:text-red-400 transition-colors cursor-pointer"
                              title={order.isFavourite ? "Remove from favorite orders" : "Mark as favorite order"}
                            >
                              <Heart className={`w-4 h-4 ${order.isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-cream/55">{order.date}</span>
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                              order.status === 'Delivered' 
                                ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                : 'bg-sunset/20 text-sunset border-sunset/30 animate-pulse'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-1.5 py-1 text-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-cream/80">{item.name} <span className="text-cream/40">x{item.quantity}</span></span>
                              <span className="text-cream/65">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Summary & Buttons */}
                        <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-1 text-xs">
                          <div>
                            <span className="text-[10px] text-cream/40 block">TOTAL AMOUNT</span>
                            <span className="font-bold text-cream text-base">₹{order.total.toFixed(2)}</span>
                          </div>

                          <div className="flex gap-2">
                            {order.status === 'Delivered' && !order.reviewed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveReviewOrderId(activeReviewOrderId === order.id ? null : order.id);
                                  setReviewRating(5);
                                  setReviewComment('');
                                }}
                                className="px-3 py-2 border border-gold/30 bg-gold/10 hover:bg-gold text-cream hover:text-navy font-bold rounded-xl text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                ★ Review Order
                              </button>
                            )}
                            {order.status !== 'Delivered' && (
                              <button
                                onClick={() => navigate(`/track-order/${order.id}`)}
                                className="px-3 py-2 border border-sunset bg-sunset/10 hover:bg-sunset text-cream hover:text-navy font-bold rounded-xl text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Compass className="w-3.5 h-3.5" />
                                Track Order
                              </button>
                            )}
                            <button
                              onClick={() => {
                                onReorder(order.items);
                              }}
                              className="px-3 py-2 border border-white/10 glass hover:bg-white/10 text-cream rounded-xl text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-gold" />
                              Reorder
                            </button>
                          </div>
                        </div>

                        {/* Inline Review Form */}
                        {activeReviewOrderId === order.id && (
                          <form 
                            onSubmit={(e) => handleSubmitReview(e, order)}
                            className="mt-3 p-4 rounded-xl glass border border-white/10 space-y-3 animate-in slide-in-from-top-2 duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gold">Rate this Feast:</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewRating(star)}
                                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                                  >
                                    <Star 
                                      className={`w-4 h-4 ${
                                        star <= reviewRating 
                                          ? 'text-gold fill-gold' 
                                          : 'text-cream/25'
                                      }`} 
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="input-field py-2 text-xs h-16 resize-none"
                                placeholder="Tell us about the flavor, quality and delivery..."
                                required
                              />
                            </div>
                            <div className="flex justify-end gap-2 text-[10px]">
                              <button
                                type="button"
                                onClick={() => setActiveReviewOrderId(null)}
                                className="px-3 py-1.5 border border-white/10 glass rounded-lg hover:bg-white/5 cursor-pointer text-cream/70"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-gradient-to-r from-sunset to-gold text-navy font-bold rounded-lg hover:opacity-90 cursor-pointer"
                              >
                                Submit Review
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 glass rounded-2xl p-6 text-cream/50">
                    <ShoppingBag className="w-12 h-12 mx-auto text-cream/30 mb-3" />
                    <p className="text-sm">You haven't placed any orders yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* MY BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="space-y-10">
                {/* ROOM BOOKINGS SECTION */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-xl font-bold text-cream">My Stay Reservations</h3>
                    <p className="text-xs text-cream/40 mt-0.5">Track your luxury room and villa stays</p>
                  </div>

                  {roomBookingsList.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {roomBookingsList.map((booking) => (
                        <div key={booking._id || booking.id} className="glass p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col gap-4">
                          <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <div>
                              <span className="text-[9px] font-mono text-cream/40 block">BOOKING ID</span>
                              <span className="text-xs font-mono font-bold text-gold">{booking.bookingId || booking.id}</span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                              booking.status?.toLowerCase() === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              booking.status?.toLowerCase() === 'confirmed' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                              booking.status?.toLowerCase() === 'checkedin' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                              booking.status?.toLowerCase() === 'checkedout' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' :
                              booking.status?.toLowerCase() === 'cancelled' || booking.status?.toLowerCase() === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                              'bg-white/10 text-cream/70 border-white/20'
                            }`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="flex gap-4 items-center">
                            {booking.image && (
                              <img src={booking.image} alt={booking.roomName} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                            )}
                            <div className="text-left">
                              <h4 className="font-display font-bold text-sm text-cream">{booking.roomName}</h4>
                              <p className="text-[11px] text-cream/60 mt-0.5">₹{booking.roomPrice?.toLocaleString()} / night</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-left text-xs text-cream/70 bg-white/5 p-3 rounded-xl">
                            <div>
                              <span className="text-[9px] text-cream/40 block">DATES</span>
                              <span>{booking.checkIn} to {booking.checkOut}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-cream/40 block">GUESTS</span>
                              <span>{booking.guests} Guest(s)</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 glass rounded-2xl p-6 text-cream/50">
                      <p className="text-sm">You haven't reserved any rooms yet.</p>
                      <button
                        onClick={() => navigate('/rooms')}
                        className="text-xs text-sunset font-bold hover:underline mt-2 cursor-pointer bg-transparent border-0"
                      >
                        Browse rooms & suites
                      </button>
                    </div>
                  )}
                </div>

                {/* TABLE BOOKINGS SECTION */}
                <div className="space-y-6 pt-4 border-t border-white/5">
                  <div>
                    <h3 className="font-display text-xl font-bold text-cream">My Table Bookings</h3>
                    <p className="text-xs text-cream/40 mt-0.5">Track the status of your dining reservations at Royal Bites</p>
                  </div>

                  {loadingBookings ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-cream/55">Loading your reservations...</p>
                    </div>
                  ) : bookingsList.length > 0 ? (
                    <div className="space-y-4">
                      {bookingsList.map((booking) => (
                        <div key={booking._id || booking.id} className="glass p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col gap-4">
                          <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-cream/40 block">RESERVATION ID</span>
                              <span className="text-sm font-mono font-bold text-gold">{booking._id || booking.id}</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-cream/55">{booking.date} at {booking.time}</span>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                                booking.status === 'confirmed' 
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                  : booking.status === 'cancelled'
                                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                    : booking.status === 'seated'
                                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                      : booking.status === 'completed'
                                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4 text-xs text-cream/80 text-left">
                            <div>
                              <span className="text-[10px] text-cream/40 block">GUESTS & OCCASION</span>
                              <span className="font-semibold text-cream text-sm">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'} — {booking.occasion}</span>
                            </div>
                            {booking.specialRequests && (
                              <div>
                                <span className="text-[10px] text-cream/40 block">SPECIAL REQUESTS</span>
                                <p className="text-cream/70 italic">&ldquo;{booking.specialRequests}&rdquo;</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 glass rounded-2xl p-6 text-cream/50">
                      <Calendar className="w-12 h-12 mx-auto text-cream/30 mb-3" />
                      <p className="text-sm">You haven't reserved any tables yet.</p>
                      <button
                        onClick={() => navigate('/booking?tab=table')}
                        className="text-xs text-sunset font-bold hover:underline mt-2 cursor-pointer bg-transparent border-0"
                      >
                        Book a table now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MY REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-cream">My Reviews</h3>
                  <p className="text-xs text-cream/40 mt-0.5">Manage the reviews you've written for your orders</p>
                </div>

                {loadingReviews ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-cream/55">Loading your reviews...</p>
                  </div>
                ) : userReviews.length > 0 ? (
                  <div className="space-y-4">
                    {userReviews.map((rev) => {
                      const revId = rev._id || rev.id;
                      const isEditing = editingReviewId === revId;
                      return (
                        <div key={revId} className="glass p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col gap-3">
                          <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-white/5">
                            <div>
                              <span className="text-[10px] text-cream/40 font-mono block">REVIEW ID: {revId}</span>
                              <span className="text-xs font-semibold text-gold mt-1 block">
                                Dish: {rev.dishName || rev.items?.join(', ') || 'N/A'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-cream/55">{rev.date}</span>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                                rev.status === 'approved' 
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                  : rev.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse'
                              }`}>
                                {rev.status || 'pending'}
                              </span>
                            </div>
                          </div>

                          {isEditing ? (
                            <form onSubmit={(e) => handleUpdateReview(e, revId)} className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gold">Edit Rating:</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setEditRating(star)}
                                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                                    >
                                      <Star 
                                        className={`w-4 h-4 ${
                                          star <= editRating 
                                            ? 'text-gold fill-gold' 
                                            : 'text-cream/25'
                                        }`} 
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <textarea
                                  value={editComment}
                                  onChange={(e) => setEditComment(e.target.value)}
                                  className="input-field py-2 text-xs h-16 resize-none"
                                  placeholder="Update your review..."
                                  required
                                />
                              </div>
                              <div className="flex justify-end gap-2 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setEditingReviewId(null)}
                                  className="px-3 py-1.5 border border-white/10 glass rounded-lg hover:bg-white/5 cursor-pointer text-cream/70"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 bg-gradient-to-r from-sunset to-gold text-navy font-bold rounded-lg hover:opacity-90 cursor-pointer"
                                >
                                  Save Updates
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <div className="flex text-gold">
                                  {Array.from({ length: rev.rating }).map((_, idx) => (
                                    <Star key={idx} className="w-3.5 h-3.5 fill-gold text-gold" />
                                  ))}
                                </div>
                              </div>

                              <p className="text-xs text-cream/80 leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
                              
                              <div className="flex justify-end gap-2 pt-2 border-t border-white/5 text-[10px]">
                                <button
                                  onClick={() => {
                                    setEditingReviewId(revId);
                                    setEditRating(rev.rating);
                                    setEditComment(rev.comment);
                                  }}
                                  className="px-3 py-1.5 border border-white/10 glass hover:bg-white/5 text-cream/80 rounded-lg font-semibold transition-colors cursor-pointer"
                                >
                                  Edit Review
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(revId)}
                                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-semibold transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 glass rounded-2xl p-6 text-cream/50">
                    <Star className="w-12 h-12 mx-auto text-cream/30 mb-3" />
                    <p className="text-sm">You haven't submitted any reviews yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* SAVED ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display text-xl font-bold text-cream">Saved Addresses</h3>
                    <p className="text-xs text-cream/40 mt-0.5">Manage delivery addresses for quick checkouts</p>
                  </div>
                  {!isAddingAddress && (
                    <button
                      onClick={() => {
                        setEditingAddressId(null);
                        setIsAddingAddress(true);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-sunset to-gold text-navy rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add New
                    </button>
                  )}
                </div>

                {isAddingAddress ? (
                  <form onSubmit={handleAddOrUpdateAddress} className="glass p-5 rounded-2xl border border-white/10 space-y-4 max-w-xl">
                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider">
                      {editingAddressId ? 'Edit Address' : 'New Address'}
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider">Address Tag</label>
                        <select
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                          className="input-field py-2 text-xs"
                        >
                          {['Home', 'Office', 'Work', 'Friends', 'Cabin', 'Other'].map(label => (
                            <option key={label} value={label} className="bg-navy">{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider font-medium">Complete Address</label>
                      <textarea
                        value={addressContent}
                        onChange={(e) => setAddressContent(e.target.value)}
                        className="input-field py-2.5 text-xs h-16 resize-none"
                        placeholder="House No., Street Name, Colony"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider">Landmark (Optional)</label>
                        <input
                          type="text"
                          value={addressLandmark}
                          onChange={(e) => setAddressLandmark(e.target.value)}
                          className="input-field py-2.5 text-xs"
                          placeholder="e.g. Near Lake"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider">City</label>
                        <input
                          type="text"
                          value={addressCity}
                          onChange={(e) => setAddressCity(e.target.value)}
                          className="input-field py-2.5 text-xs"
                          placeholder="e.g. Bhopal"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-cream/50 mb-1 uppercase tracking-wider font-medium">Pincode</label>
                        <input
                          type="text"
                          value={addressPincode}
                          onChange={(e) => setAddressPincode(e.target.value)}
                          className="input-field py-2.5 text-xs"
                          placeholder="e.g. 462001"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="flex-1 py-2.5 border border-white/10 glass rounded-xl text-xs font-semibold hover:bg-white/5 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-gradient-to-r from-sunset to-gold text-navy rounded-xl text-xs font-bold hover:opacity-90 cursor-pointer"
                      >
                        {editingAddressId ? 'Save Edits' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.length > 0 ? (
                      addresses.map(addr => (
                        <div key={addr.id} className="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="px-2.5 py-0.5 rounded-full bg-sunset/15 text-sunset text-[10px] font-bold uppercase">
                                {addr.label}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditAddress(addr)}
                                  className="text-cream/50 hover:text-gold p-1 cursor-pointer transition-colors"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="text-cream/30 hover:text-pink p-1 cursor-pointer transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-xs text-cream mt-3 leading-relaxed">{addr.address}</p>
                            {addr.landmark && (
                              <p className="text-[10px] text-cream/40 mt-1">Landmark: {addr.landmark}</p>
                            )}
                            <p className="text-[11px] text-cream/60 mt-1.5 font-medium">
                              {addr.city} - {addr.pincode}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 glass rounded-2xl p-6 text-cream/50">
                        <MapPin className="w-12 h-12 mx-auto text-cream/30 mb-3" />
                        <p className="text-sm">No saved addresses yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* FAVOURITE DISHES TAB */}
            {activeTab === 'favourites' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-cream">Favourite Dishes</h3>
                  <p className="text-xs text-cream/40 mt-0.5">Quickly access and order the signature dishes you love</p>
                </div>

                {favouriteDishesList.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {favouriteDishesList.map(dishName => {
                      const dish = getDishDetails(dishName);
                      if (!dish) return null;

                      return (
                        <div key={dishName} className="glass-card p-4 flex gap-4 border border-white/10 hover:border-sunset/35 transition-all">
                          {/* Thumbnail */}
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                            <img src={dish.image} alt={dishName} className="w-full h-full object-cover" />
                          </div>

                          {/* Details */}
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-1">
                                <div className="flex items-start gap-1 pt-0.5">
                                  <VegIndicator isVeg={dish.isVeg !== false} />
                                  <h4 className="font-display text-sm font-semibold text-cream leading-tight">{dishName}</h4>
                                </div>
                                <button
                                  onClick={() => handleToggleFavouriteDish(dishName)}
                                  className="text-red-400 p-0.5 cursor-pointer"
                                  title="Unfavourite"
                                >
                                  <Heart className="w-4 h-4 fill-red-500" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-gold">₹{dish.price}</span>
                                <span className="text-[9px] text-cream/40 flex items-center gap-0.5 bg-white/5 px-1.5 py-0.5 rounded-full">
                                  <Star className="w-2.5 h-2.5 text-gold fill-gold" />
                                  {dish.rating}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => onAddToCart(dish)}
                              className="self-end px-3 py-1 rounded-lg bg-gradient-to-r from-sunset to-gold text-navy text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 glass rounded-2xl p-6 text-cream/50">
                    <Heart className="w-12 h-12 mx-auto text-cream/30 mb-3" />
                    <p className="text-sm">You haven't favorited any dishes yet.</p>
                    <button
                      onClick={() => navigate('/menu')}
                      className="text-xs text-sunset font-bold hover:underline mt-2 cursor-pointer bg-transparent border-0"
                    >
                      Browse our menu
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
