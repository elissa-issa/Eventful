export function getServiceMongoId(item) {
  return item?.mongoId || item?._id || item?.serviceId || null
}

export function getServicePayload(item, serviceType) {
  return {
    serviceId: getServiceMongoId(item),
    serviceType,
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
