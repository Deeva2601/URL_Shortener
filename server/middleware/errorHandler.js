export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'The requested endpoint was not found.' });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  res.status(status).json({
    message: status >= 500 ? 'Something went wrong. Please try again.' : error.message
  });
}
