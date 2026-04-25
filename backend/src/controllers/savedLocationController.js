const mongoose = require('mongoose');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const { createSavedLocationDto } = require('../dto/savedLocationDto');
const savedLocationRepository = require('../repository/savedLocationRepository');

function ensureValidLocationId(locationId) {
  if (!mongoose.isValidObjectId(locationId)) {
    throw new ApiError(404, 'Saved location not found');
  }
}

const createLocation = asyncHandler(async (request, response) => {
  const locationDto = createSavedLocationDto(request.body);
  const createdLocation = await savedLocationRepository.createLocation({
    ...locationDto,
    user: request.user.id,
  });

  response.status(201).json({
    message: 'Saved location created successfully',
    data: createdLocation,
  });
});

const getLocations = asyncHandler(async (request, response) => {
  const locations = await savedLocationRepository.findByUser(request.user.id);

  response.status(200).json({
    data: locations,
  });
});

const getLocation = asyncHandler(async (request, response) => {
  ensureValidLocationId(request.params.id);

  const location = await savedLocationRepository.findByIdForUser(
    request.params.id,
    request.user.id,
  );

  if (!location) {
    throw new ApiError(404, 'Saved location not found');
  }

  response.status(200).json({
    data: location,
  });
});

const updateLocation = asyncHandler(async (request, response) => {
  ensureValidLocationId(request.params.id);

  const locationDto = createSavedLocationDto(request.body);
  const updatedLocation = await savedLocationRepository.updateByIdForUser(
    request.params.id,
    request.user.id,
    locationDto,
  );

  if (!updatedLocation) {
    throw new ApiError(404, 'Saved location not found');
  }

  response.status(200).json({
    message: 'Saved location updated successfully',
    data: updatedLocation,
  });
});

const deleteLocation = asyncHandler(async (request, response) => {
  ensureValidLocationId(request.params.id);

  const deletedLocation = await savedLocationRepository.deleteByIdForUser(
    request.params.id,
    request.user.id,
  );

  if (!deletedLocation) {
    throw new ApiError(404, 'Saved location not found');
  }

  response.status(200).json({
    message: 'Saved location deleted successfully',
  });
});

module.exports = {
  createLocation,
  getLocations,
  getLocation,
  updateLocation,
  deleteLocation,
};
