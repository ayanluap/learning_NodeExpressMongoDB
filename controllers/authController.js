const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const AppError = require('../utils/appError');

const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

// Sign Token function
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // maxAge: 24 * 60 * 60,
    // secure: true, // Cookie only sent in encrypted connection
    httpOnly: true, // Prevent cross site scripting
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // remove password field from response not from DB
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1.) check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2.) check if email and passwords are correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3.) If everything ok, then send Token
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1.) Getting the token and check if it's exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get the access.')
    );
  }

  // 2.) validate token (Verification) [Verify is an Async func.]
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3.) Check if User still exist or not
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The User belonging to this token does no longer exist!',
        401
      )
    );
  }

  // 4.) Auth check if user change password after JWT issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    next(new AppError('Password changed! Please login again.', 401));
  }

  // 5.) Grant access to the protected route
  req.user = currentUser;
  // res.locals.user = currentUser;
  next();
});

// NO ERRORS, Only for rendered pages
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // 1.) verify token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // 3.) Check if User still exist or not
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // 4.) Auth check if user change password after JWT issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      next();
    }

    // 5.) There is a logged in user
    // req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  // roles ["admin","lead-guide"] //role="user"
  if (!roles.includes(req.user.role))
    return next(
      new AppError("You don't have permission to access this route!", 403)
    );

  // permission granted
  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1.) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("User with this email doesn't exist!", 404));
  }

  // 2.) generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3.) send token back as an email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password to ${resetURL}.\nIf you didn't request for this email, the please ignore!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset Password from Travello (Valid for 10min.)',
      message,
    });

    res.status(200).json({
      status: 'success',
      messege: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending this email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1.) GEt user based on the Token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2.) Get token if Token not expired, There is a user, set the new password.
  if (!user) {
    return next(new AppError('Token has Expired!', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3.) Update PasswordChangedAt (We implemented a middleware!!)

  // 4.) Log the user in send Token
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1.) get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2.) check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong', 401));

  // 3.) If so, Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // user.findByIdAndUpdate will not work

  // 4.) Log in user, using jwt
  createSendToken(user, 200, res);
});
