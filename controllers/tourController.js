const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// ROUTE HANDLERS

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// Check id
// exports.checkId = (req, res, next, val) => {
//   const id = req.params.id * 1;
//   const tour = tours.find((el) => el.id === id * 1);
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid ID entered',
//     });
//   }
//   next();
// };

// check body middleware
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'Name / Price is missing',
//     });
//   }

//   next();
// };

// Top 5 Tours
exports.top5Tours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,description';

  next();
};

// Get All tours
exports.getAllTours = async (req, res) => {
  try {
    // Exacute the query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // send response
    res.status(200).json({
      status: 'success',
      // requestedAt: req.reqTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Get a single Tour
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id); //OR
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update some portion of tour (Patch) // Update whole tour (Put)
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Delete a tour
exports.delTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      message: 'tour deleted',
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Create a new Tour
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'new tour created',
      tour: newTour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err.message,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { avgPrice: 1 } },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err.message,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStarts: -1,
        },
      },
      {
        $limit: 6,
      },
    ]);

    res.status(200).json({
      status: 'success',
      results: plan.length,
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err.message,
    });
  }
};
