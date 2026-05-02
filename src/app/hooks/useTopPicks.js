import { useMemo, useState } from 'react'
import { BUNDLE_CARDS } from '../constants/bundleCards'
import { DECORATION_ITEMS } from '../constants/decorationItems'
import { ENTERTAINMENT_ITEMS } from '../constants/entertainmentItems'
import { MENU_ITEMS } from '../constants/menuItems'
import { VENUE_ITEMS } from '../constants/venueItems'
import { useServicesData } from './useServicesData'

export const PREMIUM_PLAN = {
  id: 'upgrade-premium',
  isUpgrade: true,
}

export function useTopPicks(visibleTopPicks, showPremiumGate = true) {
  const { itemsBySection } = useServicesData()
  const [topPicksIndex, setTopPicksIndex] = useState(0)
  const [rightArrowClickCount, setRightArrowClickCount] = useState(0)

  const topPickBaseItems = useMemo(() => {
    const venues = itemsBySection.venues || VENUE_ITEMS
    const menus = itemsBySection.menus || MENU_ITEMS
    const decorations = itemsBySection.decorations || DECORATION_ITEMS
    const entertainment = itemsBySection.entertainment || ENTERTAINMENT_ITEMS
    const bundles = itemsBySection.bundles || BUNDLE_CARDS

    return [
      { ...menus[1], section: 'menus', targetPath: `/services/menus/${menus[1]?.id}` },
      { ...venues[0], section: 'venues', targetPath: `/services/venues/${venues[0]?.id}` },
      { ...menus[0], section: 'menus', targetPath: `/services/menus/${menus[0]?.id}` },
      {
        ...entertainment[1],
        section: 'entertainment',
        targetPath: `/services/entertainment/${entertainment[1]?.id}`,
      },
      {
        ...decorations[1],
        section: 'decorations',
        targetPath: `/services/decorations/${decorations[1]?.id}`,
      },
      { ...bundles[1], section: 'bundles', targetPath: `/services/bundles/${bundles[1]?.id}` },
    ].filter((item) => item.id)
  }, [itemsBySection])

  const topPickItems = useMemo(
    () =>
      showPremiumGate && rightArrowClickCount > 2
        ? [...topPickBaseItems, PREMIUM_PLAN]
        : topPickBaseItems,
    [rightArrowClickCount, showPremiumGate, topPickBaseItems],
  )

  const maxTopPicksIndex = Math.max(topPickItems.length - visibleTopPicks, 0)
  const topPicksToRender = topPickItems.slice(topPicksIndex, topPicksIndex + visibleTopPicks)

  const handleTopPicksPrevious = () => {
    setTopPicksIndex((current) => Math.max(current - 1, 0))
  }

  const handleTopPicksNext = () => {
    const nextClickCount = rightArrowClickCount + 1
    const nextItems =
      showPremiumGate && nextClickCount > 2
        ? [...topPickBaseItems, PREMIUM_PLAN]
        : topPickBaseItems
    const nextMaxIndex = Math.max(nextItems.length - visibleTopPicks, 0)

    setRightArrowClickCount(nextClickCount)
    setTopPicksIndex((current) => Math.min(current + 1, nextMaxIndex))
  }

  return {
    maxTopPicksIndex,
    rightArrowClickCount,
    topPicksIndex,
    topPicksToRender,
    handleTopPicksNext,
    handleTopPicksPrevious,
  }
}
