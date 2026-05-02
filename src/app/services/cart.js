import { apiRequest } from './apiClient'

export function getCart(collectionId) {
  const params = new URLSearchParams(collectionId ? { collectionId } : {})
  const suffix = params.toString() ? `?${params.toString()}` : ''

  return apiRequest(`/cart${suffix}`)
}

export function createCartFromCollection(collectionId) {
  return apiRequest(`/cart/from-collection/${collectionId}`, {
    method: 'POST',
  })
}

export function createCartFromPlan(planId) {
  return apiRequest(`/cart/from-plan/${planId}`, {
    method: 'POST',
  })
}

export function addCartItem({ serviceId, serviceType, quantity = 1, selectedDate, customOptions }) {
  return apiRequest('/cart/add', {
    method: 'POST',
    body: JSON.stringify({
      serviceId,
      serviceType,
      quantity,
      selectedDate,
      customOptions,
    }),
  })
}

export function updateCartItem({ serviceId, serviceType, quantity, selectedDate, customOptions }) {
  return apiRequest('/cart/update', {
    method: 'PUT',
    body: JSON.stringify({
      serviceId,
      serviceType,
      quantity,
      selectedDate,
      customOptions,
    }),
  })
}

export function updateCartItemById(cartItemId, payload) {
  return apiRequest(`/cart/items/${cartItemId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function removeCartItem({ serviceId, serviceType }) {
  const params = new URLSearchParams({ serviceType })

  return apiRequest(`/cart/remove/${serviceId}?${params.toString()}`, {
    method: 'DELETE',
  })
}

export function removeCartItemById(cartItemId) {
  return apiRequest(`/cart/items/${cartItemId}`, {
    method: 'DELETE',
  })
}

export function checkoutCart({ collectionId, paymentMethod, status = 'paid' }) {
  return apiRequest('/cart/checkout', {
    method: 'POST',
    body: JSON.stringify({ collectionId, paymentMethod, status }),
  })
}

export function clearCart() {
  return apiRequest('/cart/clear', {
    method: 'DELETE',
  })
}
