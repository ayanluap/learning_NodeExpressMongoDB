const express = require('express'); // Nodejs framework

const morgan = require('morgan'); // 3rd party pkg. for middlewares
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const GlobalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Initalize express
const app = express();

// GLOBAL MIDDLEWARE

// Middleware which set secure the HTTP headers
app.use(helmet());

// Dev login Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Max. request limit in an hour Middleware
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, Please try again 1Hr. later!',
});
app.use('/api', limiter);

// Body Parser , read data from the body req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// Testing Middleware
app.use((req, res, next) => {
  req.reqTime = new Date().toUTCString();
  next();
});

// MOUNTING OF ROUTERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Wrong Routes (must be add BELOW of all routes)
app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(GlobalErrorHandler);

module.exports = app;
