let apiURL = import.meta.env.VITE_API_URL || '/api';
if (apiURL && apiURL !== '/api' && !apiURL.endsWith('/api') && !apiURL.endsWith('/api/')) {
  apiURL = apiURL.replace(/\/$/, '') + '/api';
}
const API_BASE = apiURL;


async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  
  // Inject JWT token if present
  const token = localStorage.getItem('rb_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  health: () => request('/health'),

  // Auth
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  profile: () => request('/auth/profile'),

  // Bookings
  createBooking: (payload) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getBookings: () => request('/bookings'),
  getBookingById: (id) => request(`/bookings/${id}`),
  updateBookingStatus: (id, status) =>
    request(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteBooking: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),

  // Inquiries
  createInquiry: (payload) =>
    request('/inquiries', { method: 'POST', body: JSON.stringify(payload) }),
  getInquiries: () => request('/inquiries'),
  updateInquiryStatus: (id, status) =>
    request(`/inquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteInquiry: (id) => request(`/inquiries/${id}`, { method: 'DELETE' }),

  // Reviews
  createReview: (payload) =>
    request('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  getReviews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request('/reviews' + (query ? '?' + query : ''));
  },
  getReviewById: (id) => request(`/reviews/${id}`),
  updateReview: (id, payload) =>
    request(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),

  // Coupons
  createCoupon: (payload) =>
    request('/coupons', { method: 'POST', body: JSON.stringify(payload) }),
  getCoupons: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request('/coupons' + (query ? '?' + query : ''));
  },
  getCouponById: (id) => request(`/coupons/${id}`),
  updateCoupon: (id, payload) =>
    request(`/coupons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteCoupon: (id) => request(`/coupons/${id}`, { method: 'DELETE' }),
  validateCoupon: (payload) =>
    request('/coupons/validate', { method: 'POST', body: JSON.stringify(payload) }),

  // Admin login backward compatibility
  adminLogin: (password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),

  // Orders
  createOrder: (payload) =>
    request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrders: () => request('/orders'),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  // Razorpay Payments
  createRazorpayOrder: (payload) =>
    request('/orders/razorpay', { method: 'POST', body: JSON.stringify(payload) }),
  verifyRazorpayPayment: (payload) =>
    request('/orders/razorpay/verify', { method: 'POST', body: JSON.stringify(payload) }),

  // Hotel Room Management & Bookings
  getRooms: () => request('/rooms'),
  updateRoomStatus: (id, status) =>
    request(`/rooms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  createRoomBooking: (payload) =>
    request('/room-bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getRoomBookings: () => request('/room-bookings'),
  getMyRoomBookings: () => request('/room-bookings/my-bookings'),
  updateRoomBookingStatus: (id, status) =>
    request(`/room-bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  // Spa Management & Bookings
  getSpaServices: () => request('/spa/services'),
  createSpaBooking: (payload) =>
    request('/spa/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getSpaBookings: () => request('/spa/bookings'),
  getMySpaBookings: () => request('/spa/bookings/my-bookings'),
  updateSpaBookingStatus: (id, payload) =>
    request(`/spa/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteSpaBooking: (id) => request(`/spa/bookings/${id}`, { method: 'DELETE' }),

  // Event & Banquet Management
  getEventPackages: () => request('/events/packages'),
  createEventBooking: (payload) =>
    request('/events/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getEventBookings: () => request('/events/bookings'),
  getMyEventBookings: () => request('/events/bookings/my-bookings'),
  updateEventBookingStatus: (id, status) =>
    request(`/events/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  deleteEventBooking: (id) => request(`/events/bookings/${id}`, { method: 'DELETE' })
};
