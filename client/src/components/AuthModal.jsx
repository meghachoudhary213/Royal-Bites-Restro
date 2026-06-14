import { useState, useEffect } from 'react';
import { X, Mail, Phone, Lock, User, MapPin } from 'lucide-react';
import { api } from '../api/api';
import { showSuccess, showError } from '../utils/toast';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Reset fields on close or mode switch
  useEffect(() => {
    setError('');
    setForgotSuccess('');
    setForgotPasswordMode(false);
  }, [isLogin, isOpen]);

  if (!isOpen) return null;

  // Initialize demo user if no users exist
  const getRegisteredUsers = () => {
    const users = localStorage.getItem('registeredUsers');
    if (!users) {
      const defaultUser = {
        name: 'Rohan Sharma',
        email: 'rohan@example.com',
        phone: '9876543210',
        password: 'password123',
        address: '123, Royal Greens Apartment, Arera Colony, Bhopal, MP',
        registrationDate: '2026-06-08',
        orders: [
          {
            id: 'RB-9821',
            date: '2026-06-08',
            items: [
              { name: 'Paneer Tikka', price: 229, quantity: 2 },
              { name: 'Butter Naan', price: 59, quantity: 3 }
            ],
            total: 635,
            paymentMethod: 'UPI',
            status: 'Delivered'
          }
        ]
      };
      localStorage.setItem('registeredUsers', JSON.stringify([defaultUser]));
      return [defaultUser];
    }
    return JSON.parse(users);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailOrPhone || !password) {
      setError('Please fill in all fields.');
      showError('Validation error. Please fill in all fields.');
      return;
    }

    try {
      // Step 1: Try database authentication via API
      let loginEmail = emailOrPhone;
      const localUsers = getRegisteredUsers();
      const localMatch = localUsers.find(u => u.phone === emailOrPhone);
      if (localMatch) {
        loginEmail = localMatch.email;
      }

      const res = await api.login({ email: loginEmail, password });
      if (res.success) {
        // Store JWT token and user details
        localStorage.setItem('rb_token', res.token);
        const syncedUser = { ...res.user, password }; 
        localStorage.setItem('currentUser', JSON.stringify(syncedUser));

        // Sync to local registered users directory
        const existsLocally = localUsers.some(u => u.email.toLowerCase() === res.user.email.toLowerCase());
        if (!existsLocally) {
          localStorage.setItem('registeredUsers', JSON.stringify([...localUsers, syncedUser]));
        }

        showSuccess('Login successful');
        onSuccess(syncedUser);
        onClose();
        return;
      }
    } catch (apiError) {
      console.warn('API authentication failed, checking localStorage fallback:', apiError.message);
    }

    // Step 2: Fallback to localStorage login
    const users = getRegisteredUsers();
    const foundUser = users.find(
      (u) => 
        (u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone === emailOrPhone) && 
        u.password === password
    );

    if (foundUser) {
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      // Clear token to avoid mismatch with local session
      localStorage.removeItem('rb_token');
      showSuccess('Login successful');
      onSuccess(foundUser);
      onClose();
    } else {
      setError('Invalid email/mobile or password. Try: rohan@example.com / password123');
      showError('Login failed. Invalid credentials.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone || !regPassword || !confirmPassword || !address) {
      setError('Please fill in all fields.');
      showError('Validation error. Please fill in all fields.');
      return;
    }

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match.');
      showError('Validation error. Passwords do not match.');
      return;
    }

    const localUsers = getRegisteredUsers();
    
    // Step 1: Try database registration via API
    try {
      const res = await api.register({
        name,
        email,
        phone,
        password: regPassword,
        address
      });

      if (res.success) {
        localStorage.setItem('rb_token', res.token);
        const newUser = { ...res.user, password: regPassword };
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        // Sync locally
        const existsLocally = localUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (!existsLocally) {
          localStorage.setItem('registeredUsers', JSON.stringify([...localUsers, newUser]));
        }

        showSuccess('Registration successful');
        onSuccess(newUser);
        onClose();
        return;
      }
    } catch (apiError) {
      console.warn('API registration failed, checking localStorage fallback:', apiError.message);
    }

    // Step 2: Fallback to localStorage registration
    if (localUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Email is already registered.');
      showError('Registration failed. Email is already registered.');
      return;
    }

    const newUser = {
      name,
      email,
      phone,
      password: regPassword,
      address,
      registrationDate: new Date().toISOString().split('T')[0],
      orders: []
    };

    const updatedUsers = [...localUsers, newUser];
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.removeItem('rb_token');
    showSuccess('Registration successful');
    onSuccess(newUser);
    onClose();
  };

  const handleGoogleLogin = () => {
    // Instantly logs in as Rohan Sharma
    const users = getRegisteredUsers();
    const rohan = users.find((u) => u.email === 'rohan@example.com');
    if (rohan) {
      localStorage.setItem('currentUser', JSON.stringify(rohan));
      showSuccess('Login successful');
      onSuccess(rohan);
      onClose();
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError('');
    setForgotSuccess('');
    
    if (!emailOrPhone) {
      setError('Please enter your email or phone number.');
      showError('Validation error. Please enter email or phone.');
      return;
    }
    
    setForgotSuccess('A password reset link has been sent to your registered contact.');
    showSuccess('A password reset link has been sent.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-navy-dark/80 backdrop-blur-md transition-opacity duration-300" 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md glass-strong rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[90vh]">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-navy/80 border border-white/10 hover:bg-sunset text-cream hover:text-navy transition-all duration-300"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-gradient">
              {forgotPasswordMode ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-xs text-cream/60 mt-1">
              {forgotPasswordMode 
                ? 'Enter details to retrieve your key to the royal dining'
                : isLogin 
                  ? 'Access your saved orders, bookings, and profile' 
                  : 'Join Royal Bites for special offers and quick booking'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-pink-soft/20 border border-pink-soft/30 text-pink text-xs text-center">
              {error}
            </div>
          )}

          {forgotSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-xs text-center">
              {forgotSuccess}
            </div>
          )}

          {/* Form */}
          {forgotPasswordMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs text-cream/60 mb-1 font-medium">Email / Mobile Number</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-cream/40" />
                  <input
                    type="text"
                    placeholder="Enter email or mobile number"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="input-field pl-10 py-3 text-sm"
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="w-full btn-primary py-3 text-sm rounded-xl mt-2">
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => setForgotPasswordMode(false)}
                className="w-full text-center text-xs text-gold hover:underline mt-4 block"
              >
                Back to Login
              </button>
            </form>
          ) : isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-cream/60 mb-1 font-medium">Email or Mobile Number</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-cream/40" />
                  <input
                    type="text"
                    placeholder="rohan@example.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="input-field pl-10 py-3 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-cream/60 mb-1 font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4.5 w-4.5 text-cream/40" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 py-3 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(true)}
                  className="text-xs text-gold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="w-full btn-primary py-3 text-sm rounded-xl mt-2">
                Login
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-cream/30 text-xs">or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              {/* Demo Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 text-xs text-cream/80 hover:bg-white/5 transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.45 7.5l3.85 2.99c.92-2.77 3.51-4.45 6.7-4.45z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-2 3.72-4.94 3.72-8.69z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.99a7.22 7.22 0 0 1 0-4.5L1.45 7.5A11.96 11.96 0 0 0 0 12c0 1.64.33 3.21.92 4.64l4.38-3.65z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.7-2.87a7.21 7.21 0 0 1-10.96-3.83L1.45 16.5A11.97 11.97 0 0 0 12 23z"
                  />
                </svg>
                Sign in with Google (Demo)
              </button>

              <p className="text-center text-xs text-cream/50 mt-4">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-gold font-semibold hover:underline"
                >
                  Create Account
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs text-cream/60 mb-0.5 font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-10 py-2.5 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-cream/60 mb-0.5 font-medium">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field pl-10 py-2.5 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-0.5 font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                    <input
                      type="email"
                      placeholder="rohan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10 py-2.5 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-cream/60 mb-0.5 font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="input-field pl-10 py-2.5 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-cream/60 mb-0.5 font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pl-10 py-2.5 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-cream/60 mb-0.5 font-medium">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                  <textarea
                    placeholder="Enter complete delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field pl-10 py-2.5 text-sm h-16 resize-none"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full btn-primary py-3 text-sm rounded-xl mt-2">
                Create Account
              </button>

              <p className="text-center text-xs text-cream/50 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-gold font-semibold hover:underline"
                >
                  Login here
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
