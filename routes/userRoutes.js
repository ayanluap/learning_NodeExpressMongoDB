const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  delUser,
} = require('../controllers/userController');

// ROUTES
const router = express.Router();

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(delUser);

module.exports = router;
