const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// queries = ?page=value
// advanced queries = duration{gte}=3

exports.getAllTours = catchAsync(async (req, res, next) => {
  const query = Tour.find();
  // Tour.find() is the function that returns the query;

  const features = new APIFeatures(query, req.query)
    .filter()
    .fields()
    .sort()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const tourId = await Tour.findById(id);

  if (!tourId) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tourId
    }
  });
});

// testado
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedTour)
    return next(new AppError('No tour found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedTour = await Tour.findByIdAndDelete(id);

  if (!deletedTour)
    return next(new AppError('No tour found with that ID', 404));

  res.status(204).json({
    status: 'success',
    data: {
      deletedTour
    }
  });
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';

  next();
};

exports.getTourStats = async (req, res) => {
  try {
    // match = select/filter documents. Prepare for grouping
    // group = group documents together using an acumulator i.e. average, sum, etc.
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingAverage: { $gte: 4.5 }
        }
      },
      {
        $group: {
          _id: '$difficulty',
          num: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          averageRating: { $avg: '$ratingAverage' },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { averagePrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'easy' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: `an error occured ${err}`
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      // unwind = still have to search it's meaning and use.
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $limit: 4
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: `an error occured: ${err}`
    });
  }
};
