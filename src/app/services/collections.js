import { apiRequest } from './apiClient'

export function getCollections() {
  return apiRequest('/collections')
}

export function createCollection(payload) {
  return apiRequest('/collections', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCollection(collectionId) {
  return apiRequest(`/collections/${collectionId}`)
}

export function updateCollection(collectionId, payload) {
  return apiRequest(`/collections/${collectionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteCollection(collectionId) {
  return apiRequest(`/collections/${collectionId}`, {
    method: 'DELETE',
  })
}

export function addItemToCollection(collectionId, itemPayload) {
  return apiRequest(`/collections/${collectionId}/items`, {
    method: 'POST',
    body: JSON.stringify(itemPayload),
  })
}

export function updateCollectionItem(collectionId, itemId, payload) {
  const section = payload.section || payload.serviceType
  const params = new URLSearchParams(section ? { section } : {})

  return apiRequest(`/collections/${collectionId}/items/${itemId}?${params.toString()}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function removeItemFromCollection(collectionId, section, itemId) {
  const params = new URLSearchParams({ section })

  return apiRequest(`/collections/${collectionId}/items/${itemId}?${params.toString()}`, {
    method: 'DELETE',
  })
}
