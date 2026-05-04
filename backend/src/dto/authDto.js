const { ApiError } = require('../helpers/apiError');

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase();
}

function ensureRequired(value, fieldName) {
  if (!value) {
    throw new ApiError(400, `${fieldName} is required`);
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePasswordStrength(password) {
  if (password.length < 8) {
    throw new ApiError(400, 'password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    throw new ApiError(400, 'password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    throw new ApiError(400, 'password must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new ApiError(400, 'password must contain at least one special character');
  }
}

function parseBirthday(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(400, 'birthday must be a valid date');
  }

  return parsedDate;
}

function createUserDto(payload = {}) {
  const firstName = normalizeString(payload.firstName);
  const lastName = normalizeString(payload.lastName);
  const email = normalizeEmail(payload.email);
  const password = normalizeString(payload.password);
  const confirmPassword = normalizeString(payload.confirmPassword);
  const birthday = parseBirthday(payload.birthday);

  ensureRequired(firstName, 'firstName');
  ensureRequired(lastName, 'lastName');
  ensureRequired(email, 'email');
  ensureRequired(password, 'password');
  ensureRequired(confirmPassword, 'confirmPassword');

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'email must be valid');
  }

  validatePasswordStrength(password);

  if (password !== confirmPassword) {
    throw new ApiError(400, 'password and confirmPassword must match');
  }

  return {
    firstName,
    lastName,
    email,
    password,
    birthday,
  };
}

function createLoginDto(payload = {}) {
  const email = normalizeEmail(payload.email);
  const password = normalizeString(payload.password);

  ensureRequired(email, 'email');
  ensureRequired(password, 'password');

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'email must be valid');
  }

  return {
    email,
    password,
  };
}

function createPasswordChangeDto(payload = {}) {
  const currentPassword = normalizeString(payload.currentPassword);
  const newPassword = normalizeString(payload.newPassword);
  const confirmNewPassword = normalizeString(payload.confirmNewPassword);

  ensureRequired(currentPassword, 'currentPassword');
  ensureRequired(newPassword, 'newPassword');
  ensureRequired(confirmNewPassword, 'confirmNewPassword');

  validatePasswordStrength(newPassword);

  if (newPassword !== confirmNewPassword) {
    throw new ApiError(400, 'newPassword and confirmNewPassword must match');
  }

  return {
    currentPassword,
    newPassword,
  };
}

function createProfileUpdateDto(payload = {}) {
  const firstName = normalizeString(payload.firstName);
  const lastName = normalizeString(payload.lastName);
  const email = normalizeEmail(payload.email);
  const birthday = parseBirthday(payload.birthday);
  const avatarSrc =
    typeof payload.avatarSrc === 'string' ? payload.avatarSrc.trim() : '';

  ensureRequired(firstName, 'firstName');
  ensureRequired(lastName, 'lastName');
  ensureRequired(email, 'email');

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'email must be valid');
  }

  return {
    firstName,
    lastName,
    email,
    birthday,
    avatarSrc,
  };
}

module.exports = {
  createUserDto,
  createLoginDto,
  createPasswordChangeDto,
  createProfileUpdateDto,
};
