import { apiRequest } from './apiClient'

export function getFavorites() {
  return apiRequest('/favorites')
}

export function toggleFavorite({ serviceId, serviceType }) {
  return apiRequest('/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ serviceId, serviceType }),
  })
}

export function addFavorite({ serviceId, serviceType }) {
  return apiRequest('/favorites/add', {
    method: 'POST',
    body: JSON.stringify({ serviceId, serviceType }),
  })
}

export function removeFavorite({ serviceId, serviceType }) {
  const params = new URLSearchParams({ serviceType })

  return apiRequest(`/favorites/remove/${serviceId}?${params.toString()}`, {
    method: 'DELETE',
  })
}
