import { apiRequest } from './apiClient'

export function checkoutOrder({ paymentMethod, status = 'paid' }) {
  return apiRequest('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({ paymentMethod, status }),
  })
}

export function getOrders() {
  return apiRequest('/orders')
}
