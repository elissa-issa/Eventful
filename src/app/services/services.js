import { apiRequest } from './apiClient'

export const SERVICE_SECTIONS = ['bundles', 'venues', 'menus', 'decorations', 'entertainment']

export async function getServicesBySection(section) {
  const result = await apiRequest(`/services/${section}`)
  return result.data || []
}

export async function getAllServices() {
  const entries = await Promise.all(
    SERVICE_SECTIONS.map(async (section) => [section, await getServicesBySection(section)])
  )

  return Object.fromEntries(entries)
}

export async function getVenueBookedDates(serviceId) {
  const result = await apiRequest(`/services/venues/${serviceId}/booked-dates`)
  return result.data || []
}
