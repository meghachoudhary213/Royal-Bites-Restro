import { Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import RoomsPage from './pages/RoomsPage';
import SpaPage from './pages/SpaPage';
import EventsPage from './pages/EventsPage';
import OffersPage from './pages/OffersPage';
import GalleryPage from './pages/GalleryPage';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import MyOrders from './components/MyOrders';
import CheckoutModal from './components/CheckoutModal';
import FoodDetailsModal from './components/FoodDetailsModal';
import ShareModal from './components/ShareModal';
import CartSidebar from './components/CartSidebar';
import DashboardPage from './pages/DashboardPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import { menuCategories as staticMenuCategories } from './data/menu';
import { showSuccess, showWarning } from './utils/toast';


export default function App() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        console.error('Failed to parse currentUser from localStorage on boot:', e);
        localStorage.removeItem('currentUser');
        return null;
      }
    }
    return null;
  });
  const [confirmState, setConfirmState] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const [menuCategories, setMenuCategories] = useState(() => {
    const stored = localStorage.getItem('rb_menu_categories');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return staticMenuCategories;
      }
    }
    localStorage.setItem('rb_menu_categories', JSON.stringify(staticMenuCategories));
    return staticMenuCategories;
  });

  // Modal and detail view states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [shareModalData, setShareModalData] = useState(null);

  // Unified Menu active states for external filters (Mega Menu, Cuisine Explorer)
  const [activeCategory, setActiveCategory] = useState('north-indian');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  useEffect(() => {
    const handleShowConfirm = (e) => {
      setConfirmState(e.detail);
    };
    window.addEventListener('show-confirm', handleShowConfirm);

    const handleShowShare = (e) => {
      setShareModalData(e.detail);
    };
    window.addEventListener('show-share', handleShowShare);
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    window.triggerShare = async (data) => {
      const shareTitle = data?.title || 'Royal Bites';
      const shareText = data?.text || 'Experience premium dining at Royal Bites 🍽️';
      const shareUrl = data?.url || 'https://royal-bites-restro.onrender.com';

      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
          });
          return;
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Web Share API error:', err);
          } else {
            return;
          }
        }
      }

      window.dispatchEvent(new CustomEvent('show-share', {
        detail: { title: shareTitle, text: shareText, url: shareUrl }
      }));
    };
    
    return () => {
      window.removeEventListener('show-confirm', handleShowConfirm);
      window.removeEventListener('show-share', handleShowShare);
      window.removeEventListener('resize', checkMobile);
      delete window.triggerShare;
    };
  }, []);

  const handleUpdateMenu = (newCategories) => {
    localStorage.setItem('rb_menu_categories', JSON.stringify(newCategories));
    setMenuCategories(newCategories);
  };



  // Listen to menu categories updates from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'rb_menu_categories' && e.newValue) {
        try {
          setMenuCategories(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddToCart = (item) => {
    if (item.available === false || item.available === 'false') {
      showWarning('Item unavailable');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showSuccess(`${item.name} added to cart!`);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (name, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(name);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.name === name ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (name) => {
    setCart((prev) => prev.filter((item) => item.name !== name));
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsProfileOpen(false);
    setIsOrdersOpen(false);
    showSuccess('Logout successful');
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const handleToggleFavouriteDish = (dishName) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const currentFavourites = currentUser.favouriteDishes || [];
    let updatedFavourites;
    if (currentFavourites.includes(dishName)) {
      updatedFavourites = currentFavourites.filter((n) => n !== dishName);
    } else {
      updatedFavourites = [...currentFavourites, dishName];
    }
    const updatedUser = {
      ...currentUser,
      favouriteDishes: updatedFavourites
    };
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = users.map((u) => 
      u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u
    );
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const handleReorder = (items) => {
    setCart((prev) => {
      let updated = [...prev];
      items.forEach((item) => {
        const existing = updated.find((i) => i.name === item.name);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          updated.push({ ...item });
        }
      });
      return updated;
    });
    setIsCartOpen(true);
  };

  const handleOrderSuccess = (updatedUser) => {
    setCurrentUser(updatedUser);
    setCart([]);
  };

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    setMenuSearchQuery('');
    navigate('/menu');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Toaster 
        position={isMobile ? 'top-center' : 'top-right'} 
        toastOptions={{
          style: {
            margin: '8px',
          }
        }}
      />
      {confirmState && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy-dark/70 backdrop-blur-sm transition-all duration-300">
          <div className="glass-strong border border-white/10 p-6 rounded-3xl max-w-sm w-full mx-4 shadow-2xl text-center">
            <h3 className="font-display text-lg font-bold text-gradient mb-3">Confirmation</h3>
            <p className="text-cream/80 text-sm mb-6 leading-relaxed">{confirmState.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirmState.onCancel) confirmState.onCancel();
                  setConfirmState(null);
                }}
                className="flex-1 py-2.5 border border-white/10 glass rounded-xl text-xs font-semibold hover:bg-white/5 cursor-pointer transition-colors text-cream"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmState.onConfirm) confirmState.onConfirm();
                  setConfirmState(null);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-sunset to-gold text-navy font-bold rounded-xl text-xs hover:opacity-90 cursor-pointer transition-transform active:scale-95"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <Routes>
      <Route
        element={
          <>
            <Navbar 
              cartCount={cartCount} 
              onOpenCart={() => setIsCartOpen(true)}
              currentUser={currentUser}
              onLogout={handleLogout}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenOrders={() => setIsOrdersOpen(true)}
              onSelectCategory={handleSelectCategory}
              onItemClick={setSelectedFoodItem}
            />
            
            <Outlet />

            <CartSidebar
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onCheckout={() => {
                setIsCartOpen(false);
                if (!currentUser) {
                  setIsAuthOpen(true);
                } else {
                  setIsCheckoutOpen(true);
                }
              }}
            />

            <AuthModal 
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
              onSuccess={handleLoginSuccess}
            />

            <UserProfile
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
            />

            <MyOrders
              isOpen={isOrdersOpen}
              onClose={() => setIsOrdersOpen(false)}
              currentUser={currentUser}
              onReorder={handleReorder}
            />

            <CheckoutModal
              isOpen={isCheckoutOpen}
              onClose={() => setIsCheckoutOpen(false)}
              cartItems={cart}
              currentUser={currentUser}
              onOrderSuccess={handleOrderSuccess}
            />

            <FoodDetailsModal
              item={selectedFoodItem}
              onClose={() => setSelectedFoodItem(null)}
              onAddToCart={handleAddToCart}
            />

            <ShareModal
              isOpen={!!shareModalData}
              onClose={() => setShareModalData(null)}
              title={shareModalData?.title}
              text={shareModalData?.text}
              url={shareModalData?.url}
            />
          </>
        }
      >
         <Route
          path="/"
          element={
            <Home
              onAddToCart={handleAddToCart}
              onItemClick={setSelectedFoodItem}
              onSelectCategory={handleSelectCategory}
              currentUser={currentUser}
              onToggleFavourite={handleToggleFavouriteDish}
              menuCategories={menuCategories}
            />
          }
        />
        <Route
          path="/menu"
          element={
            <MenuPage
              onAddToCart={handleAddToCart}
              onItemClick={setSelectedFoodItem}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={menuSearchQuery}
              setSearchQuery={setMenuSearchQuery}
              currentUser={currentUser}
              onToggleFavourite={handleToggleFavouriteDish}
              menuCategories={menuCategories}
            />
          }
        />
        <Route
          path="/booking"
          element={<BookingPage />}
        />
        <Route
          path="/rooms"
          element={<RoomsPage />}
        />
        <Route
          path="/spa"
          element={<SpaPage />}
        />
        <Route
          path="/events"
          element={<EventsPage />}
        />
        <Route
          path="/offers"
          element={<OffersPage />}
        />
        <Route
          path="/gallery"
          element={<GalleryPage />}
        />
        <Route
          path="/contact"
          element={<ContactPage />}
        />
        <Route
          path="/dashboard"
          element={
            <DashboardPage
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
              onReorder={handleReorder}
              onAddToCart={handleAddToCart}
              menuCategories={menuCategories}
            />
          }
        />
        <Route
          path="/track-order/:orderId"
          element={<OrderTrackingPage />}
        />
      </Route>
      <Route 
        path="/admin" 
        element={
          <AdminDashboard 
            menuCategories={menuCategories} 
            onUpdateMenu={handleUpdateMenu} 
          />
        } 
      />
      <Route 
        path="/royal-admin-login" 
        element={
          <AdminDashboard 
            menuCategories={menuCategories} 
            onUpdateMenu={handleUpdateMenu} 
          />
        } 
      />
    </Routes>
    </>
  );
}
