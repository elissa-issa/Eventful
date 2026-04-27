import { addLocationFields } from '../../constants/profilePage'

export const emptyLocationValues = {
  locationName: '',
  city: '',
  streetAddress: '',
  mobileNumber: '',
  apartmentFloor: '',
  zipPostalCode: '',
}

export function normalizeLocationValues(values = {}) {
  return {
    ...emptyLocationValues,
    ...values,
    apartmentFloor: values.apartmentFloor || '',
  }
}

export function getLocationValidationError(values) {
  const requiredFields = addLocationFields.filter((field) => field.required !== false)
  const missingField = requiredFields.find((field) => !values[field.id]?.trim())

  if (missingField) {
    return `${missingField.label} is required`
  }

  if (!/^\d{8}$/.test(values.mobileNumber.trim())) {
    return 'Mobile Number must be exactly 8 digits'
  }

  if (!/^\d+$/.test(values.zipPostalCode.trim())) {
    return 'ZIP / Postal Code must contain numbers only'
  }

  return ''
}
