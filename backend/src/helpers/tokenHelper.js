const crypto = require('crypto');

function toBase64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function getTokenSecret() {
  return process.env.AUTH_TOKEN_SECRET || 'eventful-dev-secret';
}

function getTokenExpirySeconds() {
  return Number(process.env.AUTH_TOKEN_EXPIRES_IN_SECONDS || 60 * 60 * 24 * 7);
}

function generateAuthToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const expiresInSeconds = getTokenExpirySeconds();
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: nowInSeconds,
    exp: nowInSeconds + expiresInSeconds,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedBody = toBase64Url(JSON.stringify(body));
  const unsignedToken = `${encodedHeader}.${encodedBody}`;
  const signature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(unsignedToken)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `${unsignedToken}.${signature}`;
}

module.exports = { generateAuthToken };
