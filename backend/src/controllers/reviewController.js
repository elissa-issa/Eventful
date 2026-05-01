const Order = require('../models/Order');
const Review = require('../models/Review');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const { validateServiceId, validateServiceType } = require('../helpers/serviceResolver');
const { getServiceByType } = require('../helpers/serviceResolver');

const REVIEWABLE_ORDER_STATUSES = ['paid', 'completed', 'delivered'];

function validateReviewTarget(serviceType, itemId) {
  validateServiceType(serviceType);
  validateServiceId(itemId, 'itemId');
}

function normalizeRating(value) {
  const rating = Number(value);

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, 'rating must be between 1 and 5');
  }

  return rating;
}

function getUserName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Eventful user';
}

function buildReviewResponse(review) {
  return {
    id: review.id,
    user: review.user.toString(),
    serviceType: review.serviceType,
    itemId: review.itemId,
    rating: review.rating,
    comment: review.comment,
    userName: review.userNameSnapshot,
    userAvatar: review.userAvatarSnapshot,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

async function getReviewStats(serviceType, itemId) {
  const [stats] = await Review.aggregate([
    { $match: { serviceType, itemId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  return {
    averageRating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
    reviewCount: stats?.reviewCount || 0,
  };
}

async function buildReviewsPayload(serviceType, itemId) {
  const reviews = await Review.find({ serviceType, itemId }).sort({ createdAt: -1 });
  const stats = await getReviewStats(serviceType, itemId);

  return {
    reviews: reviews.map(buildReviewResponse),
    ...stats,
  };
}

async function getReviewEligibility(userId, serviceType, itemId) {
  const existingReview = await Review.findOne({
    user: userId,
    serviceType,
    itemId,
  });

  if (existingReview) {
    return {
      canReview: false,
      reason: 'already_reviewed',
    };
  }

  const service = await getServiceByType(serviceType, itemId);
  const serviceMongoId = service._id.toString();
  const serviceItemId = service.itemId || service.id || itemId;
  const reviewableOrders = await Order.find({
    user: userId,
    status: { $in: REVIEWABLE_ORDER_STATUSES },
    'items.serviceType': serviceType,
  });
  const hasReviewableItem = reviewableOrders.some((order) =>
    order.items.some((item) => {
      const itemServiceType = item.serviceType || item.section;
      const itemServiceId = item.serviceId?.toString?.() || item.itemId || item.service?.id || '';
      const itemStableId = item.itemId || item.service?.itemId || item.service?.id || '';

      return (
        itemServiceType === serviceType &&
        (itemServiceId === serviceMongoId ||
          itemServiceId === serviceItemId ||
          itemStableId === serviceItemId ||
          itemStableId === serviceMongoId)
      );
    }),
  );

  return {
    canReview: hasReviewableItem,
    reason: hasReviewableItem ? null : 'not_reviewable_order_item',
  };
}

const getServiceReviews = asyncHandler(async (request, response) => {
  const { serviceType, itemId } = request.params;
  validateReviewTarget(serviceType, itemId);

  response.status(200).json({
    message: 'Reviews fetched successfully',
    data: await buildReviewsPayload(serviceType, itemId),
  });
});

const getReviewEligibilityForService = asyncHandler(async (request, response) => {
  const { serviceType, itemId } = request.params;
  validateReviewTarget(serviceType, itemId);

  response.status(200).json({
    message: 'Review eligibility fetched successfully',
    data: await getReviewEligibility(request.user.id, serviceType, itemId),
  });
});

const createServiceReview = asyncHandler(async (request, response) => {
  const { serviceType, itemId } = request.params;
  validateReviewTarget(serviceType, itemId);

  const rating = normalizeRating(request.body.rating);
  const comment = String(request.body.comment || '').trim();

  if (!comment) {
    throw new ApiError(400, 'comment is required');
  }

  const existingReview = await Review.findOne({
    user: request.user.id,
    serviceType,
    itemId,
  });

  if (existingReview) {
    throw new ApiError(409, 'You already reviewed this service');
  }

  const eligibility = await getReviewEligibility(request.user.id, serviceType, itemId);

  if (!eligibility.canReview) {
    if (eligibility.reason === 'already_reviewed') {
      throw new ApiError(409, 'You already reviewed this service');
    }

    throw new ApiError(403, 'You can only review paid or completed items you ordered.');
  }

  const review = await Review.create({
    user: request.user.id,
    serviceType,
    itemId,
    rating,
    comment,
    userNameSnapshot: getUserName(request.user),
    userAvatarSnapshot: request.user.avatarSrc || '',
  });

  const payload = await buildReviewsPayload(serviceType, itemId);

  response.status(201).json({
    message: 'Review created successfully',
    data: {
      review: buildReviewResponse(review),
      ...payload,
    },
  });
});

const deleteReview = asyncHandler(async (request, response) => {
  const review = await Review.findById(request.params.reviewId);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  if (review.user.toString() !== request.user.id) {
    throw new ApiError(403, 'You can only delete your own review');
  }

  const { serviceType, itemId } = review;
  await review.deleteOne();

  response.status(200).json({
    message: 'Review deleted successfully',
    data: await buildReviewsPayload(serviceType, itemId),
  });
});

module.exports = {
  createServiceReview,
  deleteReview,
  getReviewEligibilityForService,
  getServiceReviews,
};
