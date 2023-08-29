const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');

// no database yet

// queries = ?page=value
// advanced queries = duration{gte}=3

// testado
exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: `an error occured 🛑 ${error}`
    });
  }
};

// testado
exports.getTour = async (req, res) => {
  try {
    const { id } = req.params;

    const tourId = await Tour.findById(id);

    res.status(200).json({
      status: 'success',
      data: {
        tourId
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: `An error ocurred: ${error}`
    });
  }
};

// testado
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

// dando erro
exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: `an error ocurred: ${error}`
    });
  }
};

// dando erro
exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTour = await Tour.findByIdAndDelete(id);

    res.status(204).json({
      status: 'success',
      data: {
        deletedTour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: `an error ocurred: ${error}`
    });
  }
};

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
        $limit: 11
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
