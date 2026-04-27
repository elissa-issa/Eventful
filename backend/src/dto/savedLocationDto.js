const { ApiError } = require('../helpers/apiError');

const requiredFields = [
  'locationName',
  'city',
  'streetAddress',
  'mobileNumber',
  'zipPostalCode',
];

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function createSavedLocationDto(body) {
  const dto = {
    locationName: normalizeText(body.locationName),
    city: normalizeText(body.city),
    streetAddress: normalizeText(body.streetAddress),
    mobileNumber: normalizeText(body.mobileNumber),
    apartmentFloor: normalizeText(body.apartmentFloor),
    zipPostalCode: normalizeText(body.zipPostalCode),
  };

  const missingFields = requiredFields.filter((field) => !dto[field]);

  if (missingFields.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
  }

  if (!/^\d{8}$/.test(dto.mobileNumber)) {
    throw new ApiError(400, 'Mobile Number must be exactly 8 digits');
  }

  if (!/^\d+$/.test(dto.zipPostalCode)) {
    throw new ApiError(400, 'ZIP / Postal Code must contain numbers only');
  }

  return dto;
}

module.exports = { createSavedLocationDto };
