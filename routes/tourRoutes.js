const express = require('express');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  delTour,
  checkId,
  checkBody,
} = require('../controllers/tourController');

// ROUTES
const router = express.Router();

router.param('id', checkId);

router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(delTour);

module.exports = router;
