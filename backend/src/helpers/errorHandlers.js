function notFoundHandler(request, response) {
  response.status(404).json({
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
}

function errorHandler(error, _request, response, _next) {
  void _next;

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(', ');
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  }

  if (error.code === 11000) {
    statusCode = 409;
    const duplicatedFields = Object.keys(error.keyValue || {}).join(', ');
    message = duplicatedFields
      ? `Duplicate value for: ${duplicatedFields}`
      : 'Duplicate value';
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
