function notFoundHandler(request, response) {
  response.status(404).json({
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
}

function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    message: error.message || 'Internal server error',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
