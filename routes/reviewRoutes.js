const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');

const {
  getAllReviews,
  createReview,
  delReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');

// Router initiating
const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), delReview)
  .patch(restrictTo('user', 'admin'), updateReview);

module.exports = router;
