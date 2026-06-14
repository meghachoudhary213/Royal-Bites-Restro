const Review = require('../models/Review');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Authenticated users only)
const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment, items, dishName } = req.body;
    
    if (!orderId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    
    // Check if review already exists for this order
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this order' });
    }
    
    // Create the review
    const reviewData = {
      orderId,
      customerName: req.user.name,
      customerEmail: req.user.email.toLowerCase(),
      rating: Number(rating),
      comment,
      dishName: dishName || (items && items[0]) || '',
      items: items || [],
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      featured: false
    };
    
    const review = await Review.create(reviewData);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews
// @route   GET /api/reviews
// @access  Public (Query filters apply based on role/auth)
const getReviews = async (req, res) => {
  try {
    let query = {};
    
    // Check authorization manually to see if user is admin
    let isAdmin = false;
    let userEmail = null;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'royalbites_jwt_secret_2026');
        const user = await User.findById(decoded.id);
        if (user) {
          isAdmin = user.isAdmin;
          userEmail = user.email.toLowerCase();
        }
      } catch (err) {
        // Token invalid, treat as public
      }
    }
    
    if (isAdmin) {
      // Admin can view all or filter by query parameters
      if (req.query.status) query.status = req.query.status;
      if (req.query.featured) query.featured = req.query.featured === 'true';
    } else {
      // Non-admin can only see approved reviews OR their own reviews
      if (userEmail) {
        query.$or = [
          { status: 'approved' },
          { customerEmail: userEmail }
        ];
      } else {
        query.status = 'approved';
      }
      
      if (req.query.featured) {
        query.featured = req.query.featured === 'true';
      }
    }
    
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single review details
// @route   GET /api/reviews/:id
// @access  Private (Admins or Owner)
const getReviewById = async (req, res) => {
  try {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    let review = null;
    if (isValidObjectId) {
      review = await Review.findById(req.params.id);
    }
    if (!review) {
      review = await Review.findOne({ id: req.params.id });
    }
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Check authorization: Admin can see any, user can only see approved or their own
    let isAdmin = false;
    let userEmail = null;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'royalbites_jwt_secret_2026');
        const user = await User.findById(decoded.id);
        if (user) {
          isAdmin = user.isAdmin;
          userEmail = user.email.toLowerCase();
        }
      } catch (err) {
        // Token invalid
      }
    }
    
    if (isAdmin || review.status === 'approved' || (userEmail && review.customerEmail.toLowerCase() === userEmail)) {
      return res.json({ success: true, data: review });
    }
    
    return res.status(403).json({ success: false, message: 'Not authorized to view this review' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update review
// @route   PATCH /api/reviews/:id
// @access  Private (Admins or Owner)
const updateReview = async (req, res) => {
  try {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    let review = null;
    if (isValidObjectId) {
      review = await Review.findById(req.params.id);
    }
    if (!review) {
      review = await Review.findOne({ id: req.params.id });
    }
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Check authorization: Admin can update anything, owner can update own text/rating
    if (req.user.isAdmin) {
      const { status, featured, comment, rating, dishName, items } = req.body;
      if (status !== undefined) review.status = status;
      if (featured !== undefined) review.featured = featured;
      if (comment !== undefined) review.comment = comment;
      if (rating !== undefined) review.rating = Number(rating);
      if (dishName !== undefined) review.dishName = dishName;
      if (items !== undefined) review.items = items;
    } else if (review.customerEmail.toLowerCase() === req.user.email.toLowerCase()) {
      const { comment, rating, dishName } = req.body;
      if (comment !== undefined) review.comment = comment;
      if (rating !== undefined) review.rating = Number(rating);
      if (dishName !== undefined) review.dishName = dishName;
      review.status = 'pending'; // Reset status to pending for moderation if customer edits
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }
    
    await review.save();
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Admins or Owner)
const deleteReview = async (req, res) => {
  try {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    let review = null;
    if (isValidObjectId) {
      review = await Review.findById(req.params.id);
    }
    if (!review) {
      review = await Review.findOne({ id: req.params.id });
    }
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Check authorization: Admin or owner
    if (req.user.isAdmin || review.customerEmail.toLowerCase() === req.user.email.toLowerCase()) {
      await Review.deleteOne({ _id: review._id });
      return res.json({ success: true, message: 'Review deleted successfully' });
    }
    
    return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview
};
