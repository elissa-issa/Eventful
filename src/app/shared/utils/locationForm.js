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
  const errors = getLocationValidationErrors(values)
  const firstError = addLocationFields
    .map((field) => errors[field.id])
    .find(Boolean)

  return firstError || ''
}

export function getLocationValidationErrors(values) {
  const errors = {}
  const requiredFields = addLocationFields.filter((field) => field.required !== false)

  requiredFields.forEach((field) => {
    if (!values[field.id]?.trim()) {
      errors[field.id] = `${field.label} is required`
    }
  })

  if (!errors.mobileNumber && !/^\d{8}$/.test(values.mobileNumber.trim())) {
    errors.mobileNumber = 'Mobile Number must be exactly 8 digits'
  }

  if (!errors.zipPostalCode && !/^\d+$/.test(values.zipPostalCode.trim())) {
    errors.zipPostalCode = 'ZIP / Postal Code must contain numbers only'
  }

  return errors
}
