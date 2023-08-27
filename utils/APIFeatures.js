const APIFeatures = class {
  // query from mongoose & query string from express;
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'limit', 'sort', 'fields'];

    excludeFields.forEach(el => {
      delete queryObj[el];
    });

    let queryStr = JSON.stringify(queryObj);

    queryStr = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    );

    this.query = this.query.find(queryStr);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // my version [doesn't work with more than one comma]
      // const sortBy = req.query.sort.replace(',', ' ');
      // course version
      const sortDois = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortDois);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fields() {
    if (this.queryString.fields) {
      // const fieldsOne = req.query.fields.replace(/[,]/g, ' '); // regular expression
      const fieldsQuery = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldsQuery);
    } else {
      this.query = this.query.select('-__v'); // excluding this field, which is used by mongodb internally
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 5;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
};

module.exports = APIFeatures;
