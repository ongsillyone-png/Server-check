/**
 * Middleware to handle 404 (Not Found) errors
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).render('errors/404', {
    title: 'Page Not Found',
    path: req.originalUrl
  });
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  
  const statusCode = err.status || 500;
  const errorDetails = process.env.NODE_ENV === 'development' ? {
    message: err.message,
    stack: err.stack
  } : {
    message: 'An unexpected internal server error occurred.'
  };

  res.status(statusCode).render('errors/500', {
    title: 'Internal Server Error',
    error: errorDetails
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
