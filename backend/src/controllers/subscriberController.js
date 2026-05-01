const Subscriber = require('../models/Subscriber');
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

const createSubscriber = asyncHandler(async (request, response) => {
  const email = normalizeEmail(request.body.email);

  if (!email || !isValidEmail(email)) {
    throw new ApiError(400, 'Please enter an email in this format: name@example.com');
  }

  const user = request.user || null;
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const subscriberUpdates = {
    source: normalizeText(request.body.source) || 'newsletter',
    lastSubscribedAt: new Date(),
  };

  if (user) {
    subscriberUpdates.user = user.id;
    subscriberUpdates.userEmail = user.email || '';
    subscriberUpdates.userName = userName;
  }

  const subscriber = await Subscriber.findOneAndUpdate(
    { email },
    {
      $set: subscriberUpdates,
      $setOnInsert: {
        email,
        subscribedAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true },
  );

  response.status(201).json({
    message: 'Subscribed successfully',
    data: subscriber,
  });
});

module.exports = {
  createSubscriber,
};
