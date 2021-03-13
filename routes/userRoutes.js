const express = require('express');
const {
  signup,
  login,
  protect,
  resetPassword,
  forgotPassword,
  updatePassword,
  restrictTo,
} = require('../controllers/authController');

const {
  getAllUsers,
  getUser,
  updateUser,
  delUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/userController');

// ROUTES
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updateMyPassword', protect, updatePassword);
router.get('/me', protect, getMe, getUser);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/').get(protect, restrictTo('admin'), getAllUsers);
router
  .route('/:id')
  .get(protect, restrictTo('admin'), getUser)
  .patch(protect, restrictTo('admin'), updateUser)
  .delete(protect, restrictTo('admin'), delUser);

module.exports = router;
