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
  const selectedOptions = {
    ...(options.customOptions || {}),
    ...(options.selectedOptions || {}),
    ...(options.selectedDate ? { selectedDate: options.selectedDate } : {}),
  }

  return {
    section,
    itemId: item?.id || item?.itemId || getServiceMongoId(item),
    serviceId: getServiceMongoId(item),
    quantity: options.quantity || 1,
    selectedOptions,
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
  const customOptions = item.customOptions || item.selectedOptions || {}
  const selectedDate = item.selectedDate || customOptions.selectedDate

  if (selectedDate) {
    details.push(`Date: ${new Date(selectedDate).toLocaleDateString()}`)
  }

  if (customOptions.selectedTime) {
    details.push(`Time: ${customOptions.selectedTime}`)
  }

  details.push(`Quantity: ${item.quantity}`)

  return details
}
