const COUNTRY_WORDS = new Set(['lebanon', 'lb'])

export const normalizeSearchText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/([a-z])\1+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

const uniqueValues = (values) => [...new Set(values.filter(Boolean))]

const getSearchCandidates = (query) => {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) {
    return ['']
  }

  const commaParts = String(query)
    .split(',')
    .map(normalizeSearchText)
    .filter((part) => part && !COUNTRY_WORDS.has(part))
  const queryWithoutCountry = normalizedQuery
    .split(' ')
    .filter((word) => !COUNTRY_WORDS.has(word))
    .join(' ')

  return uniqueValues([normalizedQuery, ...commaParts, queryWithoutCountry])
}

const getBundleText = (item) =>
  (item.planItems || []).flatMap((planItem) => [
    planItem.title,
    planItem.metaText,
    planItem.priceText,
  ])

export const getSearchableText = (item, section) => {
  const baseFields = [
    item.title,
    item.description,
    item.detailsDescription,
    item.vendorName,
    item.vendorLocation,
    item.location,
    item.category,
    item.guestText,
    item.priceText,
    item.imageAlt,
    section,
  ]

  if (section === 'bundles') {
    return normalizeSearchText([
      ...baseFields,
      item.leftText,
      item.rightText,
      ...getBundleText(item),
    ].join(' '))
  }

  return normalizeSearchText(baseFields.join(' '))
}

const getFieldMatchScore = (fields, candidates, score) => {
  const fieldText = normalizeSearchText(fields.filter(Boolean).join(' '))

  if (!fieldText) {
    return null
  }

  return candidates.some((candidate) => candidate && fieldText.includes(candidate))
    ? score
    : null
}

export const getSearchMatchScore = (item, section, query) => {
  const candidates = getSearchCandidates(query)

  if (candidates.includes('')) {
    return 0
  }

  return [
    getFieldMatchScore([item.location, item.vendorLocation], candidates, 0),
    getFieldMatchScore([item.title], candidates, 1),
    getFieldMatchScore([item.vendorName], candidates, 2),
    getSearchableText(item, section).includes(candidates[0]) ||
    candidates.some((candidate) => candidate && getSearchableText(item, section).includes(candidate))
      ? 3
      : null,
  ].find((score) => score !== null) ?? null
}
