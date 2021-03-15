const path = require('path');
const express = require('express'); // Nodejs framework

const morgan = require('morgan'); // 3rd party pkg. for middlewares
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const GlobalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewsRouter = require('./routes/viewsRoutes');

// Initalize express
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARE
// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware which set secure the HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

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
app.use(express.json({ limit: '1mb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  })
);
app.use(cors());
app.use(cookieParser());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// CORS
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');

//   next();
// });
// app.use(
//   cors({
//     origin: [`${process.env.FRONT_URL}`, 'http://localhost:3000'],
//     credentials: true,
//   })
// );

// CSP ERRORS fix
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' http://127.0.0.1:3000; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' https://fonts.googleapis.com; frame-src 'self'"
  );
  next();
});

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

// Testing Middleware
app.use((req, res, next) => {
  req.reqTime = new Date().toUTCString();
  console.log(req.cookies);
  next();
});

// MOUNTING OF ROUTERS

app.use('/', viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Wrong Routes (must be add BELOW of all routes)
app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(GlobalErrorHandler);

module.exports = app;
