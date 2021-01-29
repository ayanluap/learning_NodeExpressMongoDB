const express = require('express');
const {
  signup,
  login,
  protect,
  resetPassword,
  forgotPassword,
  updatePassword,
} = require('../controllers/authController');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  delUser,
  updateMe,
  deleteMe,
} = require('../controllers/userController');

// ROUTES
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updatePassword);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/').get(protect, getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(delUser);

module.exports = router;
