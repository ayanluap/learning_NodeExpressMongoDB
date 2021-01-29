const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  delTour,
  top5Tours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

// ROUTES
const router = express.Router();

// router.param('id', checkId);

router.route('/top-5-tours').get(top5Tours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(protect, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), delTour);

module.exports = router;
