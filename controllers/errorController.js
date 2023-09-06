module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500; // status code in numbers
  err.status = err.status || 'error'; // a string that contains the status of the app, such as ok or error/fail;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};
