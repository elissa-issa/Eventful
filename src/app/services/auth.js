const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

async function sendAuthRequest(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong')
  }

  return result
}

export function signupUser(payload) {
  return sendAuthRequest('/auth/signup', payload)
}

export function loginUser(payload) {
  return sendAuthRequest('/auth/login', payload)
}
