const express = require('express');
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.get(
  '/:serviceType/:itemId/eligibility',
  requireAuth,
  reviewController.getReviewEligibilityForService,
);
router.get('/:serviceType/:itemId', reviewController.getServiceReviews);
router.post('/:serviceType/:itemId', requireAuth, reviewController.createServiceReview);
router.delete('/:reviewId', requireAuth, reviewController.deleteReview);

module.exports = router;
