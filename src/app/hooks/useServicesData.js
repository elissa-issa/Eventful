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

export function useServicesData() {
  const [apiItemsBySection, setApiItemsBySection] = useState(null)
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [servicesError, setServicesError] = useState('')

  useEffect(() => {
    let isMounted = true

    getAllServices()
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
    () => ({
      ...STATIC_ITEMS_BY_SECTION,
      ...(apiItemsBySection || {}),
    }),
    [apiItemsBySection]
  )

  return {
    itemsBySection,
    isLoadingServices,
    servicesError,
  }
}
