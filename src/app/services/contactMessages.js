import { apiRequest } from './apiClient'

export function sendContactMessage(payload) {
  return apiRequest('/contact-messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
