/**
 * Centralised error-handling middleware.
 * All errors thrown/next(err) end up here.
 */
function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log to console in dev
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR ${statusCode}]`, message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
