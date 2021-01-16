const express = require('express'); // Nodejs framework

const morgan = require('morgan'); // 3rd party pkg. for middlewares

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Initalize express
const app = express();

// MIDDLEWARE
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  // console.log('Hello, From middleware...!');
  next();
});

app.use((req, res, next) => {
  req.reqTime = new Date().toUTCString();
  next();
});

// MOUNTING OF ROUTERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
