const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour must have less or equal than 40 characters'],
      minLength: [7, 'A tour must have at least 7 characters or more']
    },
    slug: String,
    rating: {
      type: Number,
      default: 4.5
    },
    ratingAverage: {
      type: Number,
      default: 4.5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    discountPrice: {
      type: Number
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty']
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Can't find it in the query
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// arrays.map, filter & reduce + string methods, study.

// document middleawre -> runs before save() & create(). Doesn't run in insertMany();
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('will save document to the database');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// query middleware

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`query took ${Date.now() - this.start} miliseconds!`);
  console.log(docs);
  next();
});

// aggregation middleware

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

/* 
  required fields: name, price, duration, group size, difficulty, summary & image cover
*/

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
