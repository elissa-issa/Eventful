const ContactMessage = require('../models/ContactMessage');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const createContactMessage = asyncHandler(async (request, response) => {
  const fullName = normalizeText(request.body.fullName);
  const email = normalizeEmail(request.body.email);
  const message = normalizeText(request.body.message);

  if (!fullName) {
    throw new ApiError(400, 'Full name is required');
  }

  if (!email || !isValidEmail(email)) {
    throw new ApiError(400, 'Please enter an email in this format: name@example.com');
  }

  if (!message) {
    throw new ApiError(400, 'Message is required');
  }

  const user = request.user || null;
  const createdMessage = await ContactMessage.create({
    fullName,
    email,
    message,
    user: user?.id || null,
    userEmail: user?.email || '',
    userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
  });

  response.status(201).json({
    message: 'Message sent successfully',
    data: createdMessage,
  });
});

module.exports = {
  createContactMessage,
};
