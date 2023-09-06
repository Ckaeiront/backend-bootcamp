module.exports = fn => {
  // called catch async because async returns a promise.
  // a promise can be resolved or rejected, so it will be catch here;

  // function that express will gonna call, and then it can recieve req, res and next;
  // the real route handler is the fn, but express will first call the returned function
  // and then the tour handler recieves the req, res & next;

  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
