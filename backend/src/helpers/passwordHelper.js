const crypto = require('crypto');

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const ITERATIONS = 100000;
const DIGEST = 'sha512';

function pbkdf2Async(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      DIGEST,
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey.toString('hex'));
      },
    );
  });
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hashedPassword = await pbkdf2Async(password, salt);
  return `${salt}:${hashedPassword}`;
}

async function verifyPassword(password, storedPassword) {
  const [salt, originalHash] = String(storedPassword).split(':');

  if (!salt || !originalHash) {
    return false;
  }

  const currentHash = await pbkdf2Async(password, salt);

  return crypto.timingSafeEqual(
    Buffer.from(currentHash, 'hex'),
    Buffer.from(originalHash, 'hex'),
  );
}

module.exports = {
  hashPassword,
  verifyPassword,
};
