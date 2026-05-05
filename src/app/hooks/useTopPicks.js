import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { BUNDLE_CARDS } from '../constants/bundleCards'
import { DECORATION_ITEMS } from '../constants/decorationItems'
import { ENTERTAINMENT_ITEMS } from '../constants/entertainmentItems'
import { MENU_ITEMS } from '../constants/menuItems'
import { VENUE_ITEMS } from '../constants/venueItems'
import { getOrders } from '../services/orders'
import { useServicesData } from './useServicesData'

export const PREMIUM_PLAN = {
  id: 'upgrade-premium',
  isUpgrade: true,
}

const SERVICE_SECTIONS = ['menus', 'venues', 'decorations', 'entertainment', 'bundles']
const FREE_TOP_PICK_LIMIT = 8

const getRouteId = (item) => item?.routeId || item?.itemId || item?.id

function getServiceId(item) {
  return item?.mongoId || item?._id || item?.serviceId || null
}

function getCandidateKey(item) {
  return `${item.section}:${getRouteId(item)}:${getServiceId(item) || ''}`
}

function normalizeText(value) {
  return String(value || '').toLowerCase()
}

function getSearchText(item) {
  return [
    item.title,
    item.description,
    item.detailsDescription,
    item.vendorName,
    item.category,
    item.eventType,
  ].map(normalizeText).join(' ')
}

function getOrderedItemText(item) {
  return [
    item.service?.title,
    item.service?.description,
    item.service?.detailsDescription,
    item.service?.vendorName,
  ].map(normalizeText).join(' ')
}

function createCandidate(item, section, index) {
  if (!item?.id && !item?.itemId) {
    return null
  }

  const routeId = getRouteId(item)

  return {
    ...item,
    section,
    targetPath: `/services/${section}/${routeId}`,
    _topPickIndex: index,
  }
}

function buildCandidates(itemsBySection) {
  const fallbackItemsBySection = {
    bundles: BUNDLE_CARDS,
    venues: VENUE_ITEMS,
    menus: MENU_ITEMS,
    decorations: DECORATION_ITEMS,
    entertainment: ENTERTAINMENT_ITEMS,
  }

  return SERVICE_SECTIONS.flatMap((section) => {
    const items = itemsBySection[section] || fallbackItemsBySection[section] || []

    return items
      .map((item, index) => createCandidate(item, section, index))
      .filter(Boolean)
  })
}

function buildPreferenceModel(orders) {
  const sectionCounts = new Map()
  const itemCounts = new Map()
  const keywordCounts = new Map()

  for (const order of orders || []) {
    for (const item of order.items || []) {
      const section = item.serviceType || item.section
      const routeId = item.service?.itemId || item.service?.id || item.itemId
      const serviceId = item.serviceId || item.service?.mongoId || item.service?._id

      if (section) {
        sectionCounts.set(section, (sectionCounts.get(section) || 0) + 1)
      }

      if (section && routeId) {
        itemCounts.set(`${section}:${routeId}`, (itemCounts.get(`${section}:${routeId}`) || 0) + 1)
      }

      if (section && serviceId) {
        itemCounts.set(`${section}:${serviceId}`, (itemCounts.get(`${section}:${serviceId}`) || 0) + 1)
      }

      const text = getOrderedItemText(item)
      const keywordGroups = [
        ['wedding', ['wedding', 'bridal', 'bride', 'groom', 'ballroom']],
        ['food', ['food', 'menu', 'catering', 'cake', 'buffet', 'dinner']],
        ['party', ['party', 'dj', 'dance', 'birthday', 'celebration']],
        ['corporate', ['corporate', 'conference', 'launch', 'business']],
        ['outdoor', ['garden', 'outdoor', 'beach', 'terrace', 'rooftop']],
      ]

      for (const [keyword, matches] of keywordGroups) {
        if (matches.some((match) => text.includes(match))) {
          keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1)
        }
      }
    }
  }

  return { sectionCounts, itemCounts, keywordCounts }
}

function scoreCandidate(candidate, model) {
  const routeId = getRouteId(candidate)
  const serviceId = getServiceId(candidate)
  const text = getSearchText(candidate)
  let score = 0

  score += (model.sectionCounts.get(candidate.section) || 0) * 30
  score += (model.itemCounts.get(`${candidate.section}:${routeId}`) || 0) * 80

  if (serviceId) {
    score += (model.itemCounts.get(`${candidate.section}:${serviceId}`) || 0) * 80
  }

  const keywordBoosts = [
    ['wedding', ['wedding', 'bridal', 'ballroom', 'garden', 'venue']],
    ['food', ['food', 'menu', 'catering', 'cake', 'buffet', 'dinner']],
    ['party', ['party', 'dj', 'dance', 'birthday', 'celebration']],
    ['corporate', ['corporate', 'conference', 'launch', 'business']],
    ['outdoor', ['garden', 'outdoor', 'beach', 'terrace', 'rooftop']],
  ]

  for (const [keyword, matches] of keywordBoosts) {
    const keywordCount = model.keywordCounts.get(keyword) || 0

    if (keywordCount && matches.some((match) => text.includes(match))) {
      score += keywordCount * 12
    }
  }

  return score
}

export function useTopPicks(visibleTopPicks, showPremiumGate = true) {
  const { isAuthenticated } = useAuth()
  const { itemsBySection } = useServicesData()
  const [orders, setOrders] = useState([])
  const [topPicksIndex, setTopPicksIndex] = useState(0)
  const [rightArrowClickCount, setRightArrowClickCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined
    }

    let isMounted = true

    getOrders()
      .then((result) => {
        if (isMounted) {
          setOrders(result.data || [])
        }
      })
      .catch(() => {
        if (isMounted) {
          setOrders([])
        }
      })

    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  const topPickBaseItems = useMemo(() => {
    const candidates = buildCandidates(itemsBySection)
    const effectiveOrders = isAuthenticated ? orders : []
    const model = buildPreferenceModel(effectiveOrders)
    const hasOrderHistory = effectiveOrders.some((order) => (order.items || []).length > 0)

    if (!hasOrderHistory) {
      const preferredFallback = [
        ['menus', 1],
        ['venues', 0],
        ['menus', 0],
        ['entertainment', 1],
        ['decorations', 1],
        ['bundles', 1],
      ]
      const used = new Set()
      const fallbackPicks = preferredFallback
        .map(([section, index]) =>
          candidates.find((item) => item.section === section && item._topPickIndex === index)
        )
        .filter((item) => {
          const key = item ? getCandidateKey(item) : ''
          if (!item || used.has(key)) return false
          used.add(key)
          return true
        })

      return [
        ...fallbackPicks,
        ...candidates.filter((item) => !used.has(getCandidateKey(item))),
      ]
    }

    return [...candidates].sort((left, right) => {
      const scoreDifference = scoreCandidate(right, model) - scoreCandidate(left, model)

      if (scoreDifference !== 0) {
        return scoreDifference
      }

      return left._topPickIndex - right._topPickIndex
    })
  }, [isAuthenticated, itemsBySection, orders])

  const topPickItems = useMemo(() => {
    if (!showPremiumGate) {
      return topPickBaseItems
    }

    return [
      ...topPickBaseItems.slice(0, FREE_TOP_PICK_LIMIT - 1),
      PREMIUM_PLAN,
    ]
  }, [showPremiumGate, topPickBaseItems])

  const maxTopPicksIndex = Math.max(topPickItems.length - visibleTopPicks, 0)
  const boundedTopPicksIndex = Math.min(topPicksIndex, maxTopPicksIndex)
  const topPicksToRender = topPickItems.slice(
    boundedTopPicksIndex,
    boundedTopPicksIndex + visibleTopPicks,
  )

  const handleTopPicksPrevious = () => {
    setTopPicksIndex((current) => Math.max(current - 1, 0))
  }

  const handleTopPicksNext = () => {
    setRightArrowClickCount((current) => current + 1)
    setTopPicksIndex((current) => Math.min(current + 1, maxTopPicksIndex))
  }

  return {
    maxTopPicksIndex,
    rightArrowClickCount,
    topPicksIndex: boundedTopPicksIndex,
    topPicksToRender,
    handleTopPicksNext,
    handleTopPicksPrevious,
  }
}
