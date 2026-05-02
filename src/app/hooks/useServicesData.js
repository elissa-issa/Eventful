import { useEffect, useMemo, useState } from 'react'
import { BUNDLE_CARDS } from '../constants/bundleCards'
import { DECORATION_ITEMS } from '../constants/decorationItems'
import { ENTERTAINMENT_ITEMS } from '../constants/entertainmentItems'
import { MENU_ITEMS } from '../constants/menuItems'
import { VENUE_ITEMS } from '../constants/venueItems'
import { getAllServices } from '../services/services'

const STATIC_ITEMS_BY_SECTION = {
  bundles: BUNDLE_CARDS,
  venues: VENUE_ITEMS,
  menus: MENU_ITEMS,
  decorations: DECORATION_ITEMS,
  entertainment: ENTERTAINMENT_ITEMS,
}

let cachedApiItemsBySection = null
let servicesRequest = null

function getServiceIdentity(item) {
  return item?.id || item?.itemId
}

function mergeStaticWithApiItems(staticItems, apiItems = []) {
  const apiItemsById = new Map(
    apiItems
      .map((item) => [getServiceIdentity(item), item])
      .filter(([id]) => Boolean(id)),
  )

  const mergedStaticItems = staticItems.map((staticItem) => {
    const apiItem = apiItemsById.get(getServiceIdentity(staticItem))

    if (!apiItem) {
      return staticItem
    }

    return {
      ...staticItem,
      routeId: getServiceIdentity(staticItem),
      mongoId: apiItem.mongoId || apiItem._id || staticItem.mongoId,
      serviceId: apiItem.serviceId || apiItem.mongoId || apiItem._id || staticItem.serviceId,
      discountLabel: apiItem.discountLabel ?? staticItem.discountLabel,
    }
  })
  const staticIds = new Set(staticItems.map(getServiceIdentity))
  const apiOnlyItems = apiItems.filter((item) => !staticIds.has(getServiceIdentity(item)))

  return [...mergedStaticItems, ...apiOnlyItems]
}

function mergeServicesData(apiItemsBySection) {
  if (!apiItemsBySection) {
    return STATIC_ITEMS_BY_SECTION
  }

  return Object.fromEntries(
    Object.entries(STATIC_ITEMS_BY_SECTION).map(([section, staticItems]) => [
      section,
      mergeStaticWithApiItems(staticItems, apiItemsBySection[section]),
    ]),
  )
}

function loadServicesOnce() {
  if (!servicesRequest) {
    servicesRequest = getAllServices()
      .then((itemsBySection) => {
        cachedApiItemsBySection = itemsBySection
        return itemsBySection
      })
      .catch((error) => {
        servicesRequest = null
        throw error
      })
  }

  return servicesRequest
}

export function useServicesData() {
  const [apiItemsBySection, setApiItemsBySection] = useState(cachedApiItemsBySection)
  const [isLoadingServices, setIsLoadingServices] = useState(!cachedApiItemsBySection)
  const [servicesError, setServicesError] = useState('')

  useEffect(() => {
    let isMounted = true

    loadServicesOnce()
      .then((itemsBySection) => {
        if (isMounted) {
          setApiItemsBySection(itemsBySection)
          setServicesError('')
        }
      })
      .catch((error) => {
        if (isMounted) {
          setServicesError(error.message)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingServices(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const itemsBySection = useMemo(
    () => mergeServicesData(apiItemsBySection),
    [apiItemsBySection]
  )

  return {
    itemsBySection,
    isLoadingServices,
    servicesError,
  }
}
