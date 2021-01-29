const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
//////////////////////////// USERS //////////////////////////////

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // send response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create err if user POST password data
  if (req.body.password || req.body.passwordConfirm)
    next(
      new AppError(
        'This route is not for Password updates! Please visit /updateMyPassword.',
        400
      )
    );

  // Filter out unwanted fields
  const filterBody = filterObj(req.body, 'name', 'email');

  // Update user docs
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not created yet',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not created yet',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not created yet',
  });
};
exports.delUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not created yet',
  });
};
