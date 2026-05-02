import { apiRequest } from './apiClient'

async function sendAuthRequest(path, payload) {
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function signupUser(payload) {
  return sendAuthRequest('/auth/signup', payload)
}

export function loginUser(payload) {
  return sendAuthRequest('/auth/login', payload)
}

export function updateProfile(payload) {
  return apiRequest('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function upgradeToPremium(payload) {
  return apiRequest('/auth/upgrade-premium', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function cancelPremium() {
  return apiRequest('/auth/cancel-premium', {
    method: 'POST',
  })
}

export function deleteAccount() {
  return apiRequest('/auth/delete-account', {
    method: 'PATCH',
  })
}
