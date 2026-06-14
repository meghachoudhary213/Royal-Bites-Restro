import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Edit3, LogOut, Check } from 'lucide-react';
import { showSuccess, showError } from '../utils/toast';

export default function UserProfile({ isOpen, onClose, currentUser, onUpdateProfile, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('rb_sound_enabled') !== 'false';
  });

  // Sync state with currentUser
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setAddress(currentUser.address);
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
    setSoundEnabled(localStorage.getItem('rb_sound_enabled') !== 'false');
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

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !phone || !address) {
      setError('Please fill in all fields.');
      showError('Validation error. Please fill in all fields.');
      return;
    }

    // Save profile changes
    const updatedUser = {
      ...currentUser,
      name,
      email,
      phone,
      address,
    };

    // Update in registered users list
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = users.map((u) => 
      u.email.toLowerCase() === currentUser.email.toLowerCase() ? updatedUser : u
    );

    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    onUpdateProfile(updatedUser);
    setIsEditing(false);
    setSuccess('Profile updated successfully!');
    showSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-navy-dark/80 backdrop-blur-md transition-opacity duration-300" 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md glass-strong rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[90vh]">
        
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
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-cream">Royal Profile</h3>
            <p className="text-xs text-cream/50">Manage your dining account details</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto no-scrollbar flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-pink-soft/20 border border-pink-soft/30 text-pink text-xs text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-xs text-center flex items-center justify-center gap-1.5 animate-pulse">
              <Check className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-cream/60 mb-1 font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-cream/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-10 py-3 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-cream/60 mb-1 font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-cream/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10 py-3 text-sm"
                    required
                    disabled // email is user key, disable edits to prevent duplication issues
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-cream/60 mb-1 font-medium">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-cream/40" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field pl-10 py-3 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-cream/60 mb-1 font-medium">Saved Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field pl-10 py-3 text-sm h-20 resize-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-xs font-semibold text-cream hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-3 text-xs rounded-xl cursor-pointer"
                >
                  Save Updates
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Display Fields */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <User className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs text-cream/40 uppercase tracking-wider">Name</span>
                    <span className="text-cream text-base font-medium">{currentUser.name}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Mail className="w-5 h-5 text-sunset shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs text-cream/40 uppercase tracking-wider">Email Address</span>
                    <span className="text-cream text-base font-medium">{currentUser.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs text-cream/40 uppercase tracking-wider">Mobile Number</span>
                    <span className="text-cream text-base font-medium">{currentUser.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-sunset shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs text-cream/40 uppercase tracking-wider">Saved Address</span>
                    <span className="text-cream text-sm leading-relaxed">{currentUser.address}</span>
                  </div>
                </div>
              </div>

              {/* Sound Preferences */}
              <div className="p-4 rounded-2xl glass border border-white/5 space-y-2 mt-4 select-none">
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

              {/* Edit and Logout actions */}
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:border-sunset/35 text-xs text-cream font-semibold bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-gold" />
                  Edit Profile Details
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-pink-soft/10 text-xs text-pink hover:text-pink-soft font-semibold bg-pink-soft/5 hover:bg-pink-soft/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
