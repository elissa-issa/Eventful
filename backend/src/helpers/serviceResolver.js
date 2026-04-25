const mongoose = require('mongoose');
const Bundle = require('../models/Bundle');
const Decoration = require('../models/Decoration');
const Entertainment = require('../models/Entertainment');
const Menu = require('../models/Menu');
const Venue = require('../models/Venue');
const { ApiError } = require('./apiError');
const { SERVICE_TYPES } = require('../constants/serviceTypes');

const MODELS_BY_SERVICE_TYPE = {
  menus: Menu,
  venues: Venue,
  decorations: Decoration,
  entertainment: Entertainment,
  bundles: Bundle,
};

function validateServiceType(serviceType) {
  if (!SERVICE_TYPES.includes(serviceType)) {
    throw new ApiError(
      400,
      `serviceType must be one of: ${SERVICE_TYPES.join(', ')}`,
    );
  }
}

function validateObjectId(value, fieldName = 'serviceId') {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `${fieldName} must be a valid MongoDB ObjectId`);
  }
}

function getServiceModel(serviceType) {
  validateServiceType(serviceType);
  return MODELS_BY_SERVICE_TYPE[serviceType];
}

async function getServiceByType(serviceType, serviceId) {
  validateServiceType(serviceType);
  validateObjectId(serviceId);

  const Model = getServiceModel(serviceType);
  const service = await Model.findById(serviceId);

  if (!service) {
    throw new ApiError(404, `${serviceType} service not found`);
  }

  return service;
}

function getServiceSummary(service) {
  return {
    id: service.id,
    mongoId: service._id.toString(),
    title: service.title,
    priceValue: service.priceValue,
    priceText: service.priceText,
    imageSrc: service.imageSrc,
    imageAlt: service.imageAlt,
  };
}

async function attachServiceDetails(items) {
  return Promise.all(
    items.map(async (item) => {
      const itemObject = item.toObject ? item.toObject() : item;
      const service = await getServiceByType(
        itemObject.serviceType,
        itemObject.serviceId,
      );

      return {
        ...itemObject,
        serviceId: itemObject.serviceId.toString(),
        service: getServiceSummary(service),
      };
    }),
  );
}

module.exports = {
  attachServiceDetails,
  getServiceByType,
  getServiceModel,
  getServiceSummary,
  validateObjectId,
  validateServiceType,
};
