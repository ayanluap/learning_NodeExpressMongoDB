const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

// creating schema

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: 'true',
      maxlength: [40, 'A tour must contain less than 50 aplphabets!'],
      minlength: [10, 'A tour must contain more than 10 aplphabets!'],
      // validate: [validator.isAlpha, 'A Tour name must only contain characters'],
    },
    slug: { type: String },
    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a Max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a Difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: Easy, Medium or Difficult',
      },
    },
    rating: { type: Number, default: 4.5 },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // This only points to New document on New document creation nut not work on Update!!!!
          return val < this.price;
        },
        message: 'Price Discount {VALUE} must be less than Price!',
      },
    },
    summary: { type: String, trim: true },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a Description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an cover Image'],
    },
    images: [String],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE : Runs before .save() and .create()  (MONGOOSE)
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); // this keyword here is the document object
  next();
});

// QUERY MIDDLEWARE : Allows us to run function before or after a certain query   (MONGOOSE)

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); // this keyword here is the query

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} ms`);
  next();
});

// AGGREGATION MIDDLEWARE : IT ALLOWS us to use hooks before and after aggregation
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// creating a model from the schema (Model name should always start with capital letter)
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
