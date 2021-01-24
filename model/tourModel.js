const mongoose = require('mongoose');

// creating schema

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: 'true',
  },
  duration: { type: Number, required: [true, 'A tour must have a duration'] },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a Max group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a Difficulty'],
  },
  rating: { type: Number, default: 4.5 },
  ratingsAverage: { type: Number, default: 0 },
  ratingsQuantity: { type: Number, default: 0 },
  price: { type: Number, required: [true, 'A tour must have a price'] },
  priceDiscount: Number,
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
});

// creating a model from the schema (Model name should always start with capital letter)
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
