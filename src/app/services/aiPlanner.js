import { apiRequest } from './apiClient'

export function generateInspirationPlan(message) {
  return apiRequest('/ai/inspiration-plan', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}
