// Errors Handling Middleware.
export default (err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong';
  return res.status(statusCode).send({
    error: err,
    stack: err.stack,
  });
};
