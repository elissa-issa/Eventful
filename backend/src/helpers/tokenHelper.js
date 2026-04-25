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

function fromBase64Url(value) {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalizedValue.length % 4)) % 4);

  return Buffer.from(`${normalizedValue}${padding}`, 'base64').toString('utf8');
}

function verifyAuthToken(token) {
  const [encodedHeader, encodedBody, signature] = token.split('.');

  if (!encodedHeader || !encodedBody || !signature) {
    return null;
  }

  const unsignedToken = `${encodedHeader}.${encodedBody}`;
  const expectedSignature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(unsignedToken)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  const providedSignature = Buffer.from(signature);
  const validSignature = Buffer.from(expectedSignature);

  if (
    providedSignature.length !== validSignature.length ||
    !crypto.timingSafeEqual(providedSignature, validSignature)
  ) {
    return null;
  }

  let payload;

  try {
    payload = JSON.parse(fromBase64Url(encodedBody));
  } catch {
    return null;
  }
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < nowInSeconds) {
    return null;
  }

  return payload;
}

module.exports = { generateAuthToken, verifyAuthToken };
