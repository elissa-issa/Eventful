function parsePriceText(value) {
  const match = String(value || '').match(/[\d,.]+/)

  if (!match) {
    return null
  }

  const amount = Number(match[0].replace(/,/g, ''))

  return Number.isFinite(amount) ? amount : null
}

function getPriceValue(item) {
  const numericPrice = Number(item?.priceValue)

  if (Number.isFinite(numericPrice) && numericPrice > 0) {
    return numericPrice
  }

  return parsePriceText(item?.priceText)
}

function getBundleComponentItems(bundle) {
  const components = bundle?.components

  if (!components) {
    return []
  }

  return [
    components.venue,
    ...(components.menus || []),
    ...(components.entertainment || []),
    ...(components.decorations || []),
  ].filter(Boolean)
}

export function getBundlePriceValue(bundle) {
  const planItems = Array.isArray(bundle?.planItems) ? bundle.planItems : []
  const componentItems = getBundleComponentItems(bundle)
  const priceItems = planItems.length ? planItems : componentItems
  const total = priceItems.reduce((sum, item) => sum + (getPriceValue(item) || 0), 0)

  return total > 0 ? total : Number(bundle?.priceValue || 0)
}

export function formatBundlePrice(value) {
  const amount = Number(value || 0)

  return `$${Math.round(amount).toLocaleString('en-US')}`
}

export function getBundlePriceText(bundle) {
  return `Starting ${formatBundlePrice(getBundlePriceValue(bundle))}/Night`
}

export function withBundlePricing(bundle) {
  const priceValue = getBundlePriceValue(bundle)

  return {
    ...bundle,
    priceValue,
    priceText: getBundlePriceText({ ...bundle, priceValue }),
    leftText: `Starting ${formatBundlePrice(priceValue)}`,
  }
}
