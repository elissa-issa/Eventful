import { apiRequest } from './apiClient'

export function getCustomizedPlans() {
  return apiRequest('/customized-plans')
}

export function createCustomizedPlan(payload) {
  return apiRequest('/customized-plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCustomizedPlan(planId) {
  return apiRequest(`/customized-plans/${planId}`)
}

export function updateCustomizedPlan(planId, payload) {
  return apiRequest(`/customized-plans/${planId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteCustomizedPlan(planId) {
  return apiRequest(`/customized-plans/${planId}`, {
    method: 'DELETE',
  })
}

export function addItemToCustomizedPlan(planId, itemPayload) {
  return apiRequest(`/customized-plans/${planId}/items`, {
    method: 'POST',
    body: JSON.stringify(itemPayload),
  })
}

export function updateCustomizedPlanItem(planId, itemId, payload) {
  const section = payload.section || payload.serviceType
  const params = new URLSearchParams(section ? { section } : {})

  return apiRequest(`/customized-plans/${planId}/items/${itemId}?${params.toString()}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function removeItemFromCustomizedPlan(planId, section, itemId) {
  const params = new URLSearchParams({ section })

  return apiRequest(`/customized-plans/${planId}/items/${itemId}?${params.toString()}`, {
    method: 'DELETE',
  })
}
