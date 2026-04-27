const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

async function sendSavedLocationRequest(path, { method = 'GET', payload, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong')
  }

  return result
}

export function getSavedLocations(token) {
  return sendSavedLocationRequest('/locations', { token })
}

export function createSavedLocation(payload, token) {
  return sendSavedLocationRequest('/locations', {
    method: 'POST',
    payload,
    token,
  })
}

export function updateSavedLocation(locationId, payload, token) {
  return sendSavedLocationRequest(`/locations/${locationId}`, {
    method: 'PUT',
    payload,
    token,
  })
}

export function deleteSavedLocation(locationId, token) {
  return sendSavedLocationRequest(`/locations/${locationId}`, {
    method: 'DELETE',
    token,
  })
}
