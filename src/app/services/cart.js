import { apiRequest } from './apiClient'

export function getCart() {
  return apiRequest('/cart')
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

export function removeCartItem({ serviceId, serviceType }) {
  const params = new URLSearchParams({ serviceType })

  return apiRequest(`/cart/remove/${serviceId}?${params.toString()}`, {
    method: 'DELETE',
  })
}

export function clearCart() {
  return apiRequest('/cart/clear', {
    method: 'DELETE',
  })
}
