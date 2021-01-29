const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data : ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJwtError = () =>
  new AppError('Invalid token! Please login again!', 401);

const handleTokenExpiredError = () =>
  new AppError('Your token is expired! Please login again', 401);

//  Error (Dev mode)
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    error: err,
    errorName: err.name,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

// Error (Prod mode)
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Operational trusted error : Show details to the user/client

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programming error : Dont show to clients or users
    console.log('Error : ', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

// Global error handling
module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'MongoError') error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJwtError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();

    // production error
    sendErrorProd(error, res);
  }
};
