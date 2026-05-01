const User = require('../models/User');
const { verifyAuthToken } = require('../helpers/tokenHelper');

async function optionalAuth(request, _response, next) {
  const authHeader = request.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next();
    return;
  }

  try {
    const payload = verifyAuthToken(token);

    if (payload?.userId) {
      request.user = await User.findById(payload.userId);
    }
  } catch {
    request.user = null;
  }

  next();
}

module.exports = { optionalAuth };
