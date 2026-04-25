const User = require('../models/User');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const { verifyAuthToken } = require('../helpers/tokenHelper');

const requireAuth = asyncHandler(async (request, _response, next) => {
  const authHeader = request.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Authentication token is required');
  }

  const payload = verifyAuthToken(token);

  if (!payload?.userId) {
    throw new ApiError(401, 'Invalid or expired authentication token');
  }

  const user = await User.findById(payload.userId);

  if (!user) {
    throw new ApiError(401, 'Authenticated user no longer exists');
  }

  request.user = user;
  next();
});

module.exports = { requireAuth };
