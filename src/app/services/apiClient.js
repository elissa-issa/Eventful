import { getStoredAuth } from '../auth/storage'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export async function apiRequest(path, options = {}) {
  const storedAuth = getStoredAuth()
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(storedAuth?.token ? { Authorization: `Bearer ${storedAuth.token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })
  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong')
  }

  return result
}
