export function getServiceMongoId(item) {
  return item?.mongoId || item?._id || item?.serviceId || null
}

export function getServicePayload(item, serviceType) {
  return {
    serviceId: getServiceMongoId(item),
    serviceType,
  }
}

export function getCollectionItemPayload(item, section, options = {}) {
  return {
    section,
    itemId: item?.id || item?.itemId || getServiceMongoId(item),
    serviceId: getServiceMongoId(item),
    quantity: options.quantity || 1,
    selectedOptions: options.customOptions || options.selectedOptions || {},
    pricingSnapshot: {
      priceValue: item?.priceValue,
      priceText: item?.priceText,
    },
    titleSnapshot: item?.title || '',
    imageSnapshot: item?.imageSrc || '',
    vendorSnapshot: item?.vendorName || '',
    priceTextSnapshot: item?.priceText || '',
  }
}

export function formatCartItemDetails(item) {
  const details = []

  if (item.selectedDate) {
    details.push(`Date: ${new Date(item.selectedDate).toLocaleDateString()}`)
  }

  details.push(`Quantity: ${item.quantity}`)

  if (item.serviceType) {
    details.push(`Type: ${item.serviceType}`)
  }

  return details
}
