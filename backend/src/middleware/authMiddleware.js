const { ApiError } = require('../helpers/apiError');
const { verifyAuthToken } = require('../helpers/tokenHelper');

function authenticate(request, _response, next) {
  const authorizationHeader = request.headers.authorization || '';
  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(new ApiError(401, 'Authentication is required'));
    return;
  }

  const payload = verifyAuthToken(token);

  if (!payload?.userId) {
    next(new ApiError(401, 'Invalid or expired authentication token'));
    return;
  }

  request.user = {
    id: payload.userId,
    email: payload.email,
  };

  next();
}

module.exports = { authenticate };
