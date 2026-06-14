const express = require('express');
const { 
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview 
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createReview);
router.get('/', getReviews); // Public get (handles role filtering internally)
router.get('/:id', getReviewById); // Public/private (handles role filtering internally)
router.patch('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
