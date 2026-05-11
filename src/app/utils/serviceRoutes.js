export function getServiceRouteSection(sectionOrType) {
  const normalized = String(sectionOrType || '').toLowerCase()

  if (normalized.includes('menu')) return 'menus'
  if (normalized.includes('venue')) return 'venues'
  if (normalized.includes('decoration')) return 'decorations'
  if (normalized.includes('entertainment')) return 'entertainment'
  if (normalized.includes('bundle')) return 'bundles'

  return normalized
}

export function getServiceItemRoute(service, fallbackSection, options = {}) {
  const section = getServiceRouteSection(
    fallbackSection || service?.section || service?.serviceType || service?.type,
  )
  const itemId = service?.routeId || service?.itemId || service?.id || service?._id

  if (!section || !itemId) {
    return null
  }

  const planQuery = options.planId ? `?planId=${options.planId}` : ''

  return `/services/${section}/${itemId}${planQuery}`
}
