const fs = require('fs');

// ROUTE HANDLERS

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// Check id
exports.checkId = (req, res, next, val) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id * 1);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID entered',
    });
  }
  next();
};

// check body middleware
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'error',
      message: 'Name / Price is missing',
    });
  }

  next();
};

// Get All tours
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.reqTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

// Get a single Tour
exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id * 1);

  return res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

// Update some portion of tour (Patch) // Update whole tour (Put)
exports.updateTour = (req, res) =>
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour here...>',
    },
  });
// Delete a tour
exports.delTour = (req, res) =>
  res.status(204).json({
    status: 'success',
    data: 'data deleted...',
  });

// Create a new Tour
exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        message: 'new tour created',
        tour: newTour,
      });
    }
  );
};
