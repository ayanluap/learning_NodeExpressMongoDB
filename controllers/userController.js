const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
//////////////////////////// USERS //////////////////////////////

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

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

exports.getAllUsers = getAll(User);
exports.getUser = getOne(User);
// Do not update password with this!! ...Middleware will not work
exports.updateUser = updateOne(User);
exports.delUser = deleteOne(User);
