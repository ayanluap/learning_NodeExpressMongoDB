const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');

const reviewRouter = require('./reviewRoutes');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  delTour,
  top5Tours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} = require('../controllers/tourController');

// ROUTES
const router = express.Router();

// router.param('id', checkId);

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-tours').get(top5Tours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(protect, getMonthlyPlan);

// /tours-within?distance=40&center=-40,34&unit=mi
// /tours-within/distance/40/center/-40,34/unit/mi
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), delTour);

module.exports = router;
