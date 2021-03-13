const express = require('express');
const { protect } = require('../controllers/authController');
const {
  getOverview,
  getTour,
  getLoginForm,
  getSignupForm,
} = require('../controllers/viewsController');

const router = express.Router();

router.get('/', getOverview);
router.get('/tour/:slug', protect, getTour);
router.get('/login', getLoginForm);
router.get('/signup', getSignupForm);

module.exports = router;
