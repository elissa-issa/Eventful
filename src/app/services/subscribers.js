import { apiRequest } from './apiClient'

export function subscribeToNewsletter(email) {
  return apiRequest('/subscribers', {
    method: 'POST',
    body: JSON.stringify({
      email,
      source: 'newsletter',
    }),
  })
}
