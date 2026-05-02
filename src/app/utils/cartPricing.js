const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

function getItemDate(item) {
  const customOptions = item.customOptions || item.selectedOptions || {}
  const selectedDate = item.selectedDate || customOptions.selectedDate

  if (!selectedDate) {
    return null
  }

  const date = new Date(selectedDate)

  return Number.isNaN(date.getTime()) ? null : date
}

function getBaseLineTotal(item) {
  return Number(item.service?.priceValue || 0) * Number(item.quantity || 1)
}

function getPromotionAmount(item) {
  const discountLabel = String(item.service?.discountLabel || '').trim()
  const quantity = Number(item.quantity || 1)
  const unitPrice = Number(item.service?.priceValue || 0)
  const lineTotal = unitPrice * quantity

  if (!discountLabel || lineTotal <= 0) {
    return 0
  }

  const percentageForQuantityMatch = discountLabel.match(/(\d+)%\s*off\s*for\s*(\d+)\+/i)

  if (percentageForQuantityMatch) {
    const percentage = Number(percentageForQuantityMatch[1])
    const minQuantity = Number(percentageForQuantityMatch[2])

    return quantity >= minQuantity ? lineTotal * (percentage / 100) : 0
  }

  const percentageForDayMatch = discountLabel.match(/(\d+)%\s*off\s*on\s*([a-z]+)/i)

  if (percentageForDayMatch) {
    const date = getItemDate(item)
    const percentage = Number(percentageForDayMatch[1])
    const weekday = percentageForDayMatch[2].toLowerCase()

    if (date && WEEKDAYS[date.getDay()] === weekday) {
      return lineTotal * (percentage / 100)
    }

    return 0
  }

  const freeUnitsMatch = discountLabel.match(/buy\s*(\d+)\s*get\s*(\d+)\s*for\s*free/i)

  if (freeUnitsMatch) {
    const buyQuantity = Number(freeUnitsMatch[1])
    const freeQuantity = Number(freeUnitsMatch[2])
    const bundleSize = buyQuantity + freeQuantity

    if (bundleSize <= 0 || quantity < bundleSize) {
      return 0
    }

    const fullBundles = Math.floor(quantity / bundleSize)
    const freeUnits = fullBundles * freeQuantity

    return freeUnits * unitPrice
  }

  return 0
}

export function getCartItemPricing(item) {
  const retailTotal = getBaseLineTotal(item)
  const promotionTotal = Math.min(getPromotionAmount(item), retailTotal)

  return {
    retailTotal,
    promotionTotal,
    total: retailTotal - promotionTotal,
  }
}

export function getCartPricing(items) {
  return items.reduce(
    (summary, item) => {
      const itemPricing = getCartItemPricing(item)

      return {
        retailTotal: summary.retailTotal + itemPricing.retailTotal,
        promotionTotal: summary.promotionTotal + itemPricing.promotionTotal,
        total: summary.total + itemPricing.total,
      }
    },
    {
      retailTotal: 0,
      promotionTotal: 0,
      total: 0,
    },
  )
}
