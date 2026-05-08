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

const POPULATE_BUNDLE_COMPONENTS = [
  { path: 'venue' },
  { path: 'menus' },
  { path: 'entertainment' },
  { path: 'decorations' },
];

function buildServiceFilter(serviceId) {
  if (mongoose.Types.ObjectId.isValid(serviceId)) {
    return {
      $or: [{ _id: serviceId }, { itemId: serviceId }],
    };
  }

  return { itemId: serviceId };
}

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

function validateServiceId(value, fieldName = 'itemId') {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, `${fieldName} is required`);
  }
}

function getServiceModel(serviceType) {
  validateServiceType(serviceType);
  return MODELS_BY_SERVICE_TYPE[serviceType];
}

async function getServiceByType(serviceType, serviceId) {
  validateServiceType(serviceType);
  validateServiceId(String(serviceId || ''), 'serviceId');

  const Model = getServiceModel(serviceType);
  const query = Model.findOne(buildServiceFilter(String(serviceId)));
  const service =
    serviceType === 'bundles'
      ? await query.populate(POPULATE_BUNDLE_COMPONENTS)
      : await query;

  if (!service) {
    throw new ApiError(404, `${serviceType} service not found`);
  }

  if (serviceType === 'bundles') {
    const priceValue = getBundlePriceValue(service);
    service.priceValue = priceValue;
    service.priceText = `Starting ${formatPrice(priceValue)}/Night`;
  }

  return service;
}

function getServicePriceValue(service) {
  const numericPrice = Number(service?.priceValue);

  if (Number.isFinite(numericPrice) && numericPrice > 0) {
    return numericPrice;
  }

  const match = String(service?.priceText || '').match(/[\d,.]+/);

  if (!match) {
    return 0;
  }

  const parsedPrice = Number(match[0].replace(/,/g, ''));

  return Number.isFinite(parsedPrice) ? parsedPrice : 0;
}

function getBundleComponentPrices(service) {
  return [
    service.venue,
    ...(service.menus || []),
    ...(service.entertainment || []),
    ...(service.decorations || []),
  ].filter(Boolean);
}

function getBundlePriceValue(service) {
  const planItems = service.planItems || [];
  const priceItems = planItems.length ? planItems : getBundleComponentPrices(service);
  const total = priceItems.reduce(
    (sum, item) => sum + getServicePriceValue(item),
    0,
  );

  return total > 0 ? total : service.priceValue;
}

function formatPrice(value) {
  return `$${Math.round(value || 0).toLocaleString('en-US')}`;
}

function getServiceSummary(service) {
  const isBundle = service instanceof Bundle || service.constructor?.modelName === 'Bundle';
  const priceValue = isBundle ? getBundlePriceValue(service) : service.priceValue;

  return {
    id: service.itemId || service.id,
    mongoId: service._id.toString(),
    title: service.title,
    priceValue,
    priceText: isBundle ? `Starting ${formatPrice(priceValue)}/Night` : service.priceText,
    discountLabel: service.discountLabel,
    imageSrc: service.imageSrc,
    imageAlt: service.imageAlt,
    vendorName: service.vendorName,
    vendorLogoSrc: service.vendorLogoSrc,
    vendorLogoAlt: service.vendorLogoAlt,
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
  validateServiceId,
  validateServiceType,
};
