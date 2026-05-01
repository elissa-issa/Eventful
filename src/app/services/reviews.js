import { apiRequest } from './apiClient'

export function getServiceReviews(serviceType, itemId) {
  return apiRequest(`/reviews/${serviceType}/${itemId}`)
}

export function createServiceReview(serviceType, itemId, payload) {
  return apiRequest(`/reviews/${serviceType}/${itemId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function checkReviewEligibility(serviceType, itemId) {
  return apiRequest(`/reviews/${serviceType}/${itemId}/eligibility`)
}
