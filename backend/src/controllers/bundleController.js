const mongoose = require('mongoose');
const Bundle = require('../models/Bundle');
const Decoration = require('../models/Decoration');
const Entertainment = require('../models/Entertainment');
const Menu = require('../models/Menu');
const Venue = require('../models/Venue');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');

const POPULATE_BUNDLE_COMPONENTS = [
  { path: 'venue' },
  { path: 'menus' },
  { path: 'entertainment' },
  { path: 'decorations' },
];

function normalizeServicePayload(payload) {
  const normalizedPayload = { ...payload };

  if (Object.prototype.hasOwnProperty.call(normalizedPayload, 'id')) {
    normalizedPayload.itemId = normalizedPayload.id;
    delete normalizedPayload.id;
  }

  return normalizedPayload;
}

function buildIdFilter(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return {
      $or: [{ itemId: id }, { _id: id }],
    };
  }

  return { itemId: id };
}

function hasBundleComponentFields(payload) {
  return [
    'venue',
    'venueId',
    'menus',
    'menuIds',
    'entertainment',
    'entertainmentIds',
    'decorations',
    'decorationIds',
  ].some((field) => Object.prototype.hasOwnProperty.call(payload, field));
}

function getArrayValue(payload, primaryField, fallbackField) {
  const value = payload[primaryField] ?? payload[fallbackField];

  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
}

function getReferenceId(value) {
  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (value && typeof value === 'object') {
    return value.mongoId || value._id || value.id || value.itemId;
  }

  return value;
}

async function findServiceReference(Model, value, fieldName) {
  const referenceId = getReferenceId(value);

  if (!referenceId) {
    throw new ApiError(400, `${fieldName} is required`);
  }

  const service = await Model.findOne(buildIdFilter(referenceId));

  if (!service) {
    throw new ApiError(404, `${fieldName} service not found`);
  }

  return service._id;
}

async function findServiceReferences(Model, values, fieldName) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new ApiError(400, `${fieldName} must include at least one item`);
  }

  return Promise.all(
    values.map((value) => findServiceReference(Model, value, fieldName)),
  );
}

async function normalizeBundleComponents(payload, requireCompleteComposition) {
  const normalizedPayload = { ...payload };
  const venueValue = payload.venue ?? payload.venueId;
  const menuValues = getArrayValue(payload, 'menus', 'menuIds');
  const entertainmentValues = getArrayValue(
    payload,
    'entertainment',
    'entertainmentIds',
  );
  const decorationValues = getArrayValue(payload, 'decorations', 'decorationIds');

  delete normalizedPayload.venueId;
  delete normalizedPayload.menuIds;
  delete normalizedPayload.entertainmentIds;
  delete normalizedPayload.decorationIds;

  if (requireCompleteComposition) {
    if (venueValue === undefined) {
      throw new ApiError(400, 'venue is required');
    }

    if (menuValues === undefined) {
      throw new ApiError(400, 'menus must include at least one item');
    }

    if (entertainmentValues === undefined) {
      throw new ApiError(
        400,
        'entertainment must include at least one item',
      );
    }

    if (decorationValues === undefined) {
      throw new ApiError(400, 'decorations must include at least one item');
    }
  }

  if (venueValue !== undefined) {
    normalizedPayload.venue = await findServiceReference(
      Venue,
      venueValue,
      'venue',
    );
  }

  if (menuValues !== undefined) {
    normalizedPayload.menus = await findServiceReferences(
      Menu,
      menuValues,
      'menus',
    );
  }

  if (entertainmentValues !== undefined) {
    normalizedPayload.entertainment = await findServiceReferences(
      Entertainment,
      entertainmentValues,
      'entertainment',
    );
  }

  if (decorationValues !== undefined) {
    normalizedPayload.decorations = await findServiceReferences(
      Decoration,
      decorationValues,
      'decorations',
    );
  }

  return normalizedPayload;
}

function toPlainService(service, serviceType) {
  if (!service || typeof service !== 'object' || !service.title) {
    return null;
  }

  const serviceObject = service.toJSON ? service.toJSON() : service;

  return {
    ...serviceObject,
    serviceType,
    serviceId: serviceObject.mongoId || serviceObject._id?.toString(),
  };
}

function toPlanItem(service, serviceType) {
  const serviceObject = toPlainService(service, serviceType);

  if (!serviceObject) {
    return null;
  }

  return {
    id: `${serviceType}-${serviceObject.id}`,
    serviceType,
    serviceId: serviceObject.serviceId,
    title: serviceObject.title,
    metaText:
      serviceObject.guestText ||
      serviceObject.supportingInfoText ||
      serviceObject.detailBadgeText ||
      serviceObject.vendorLocation ||
      '',
    priceText: serviceObject.priceText,
    imageSrc: serviceObject.imageSrc,
    imageAlt: serviceObject.imageAlt,
  };
}

function presentBundle(bundle) {
  const bundleObject = bundle.toJSON ? bundle.toJSON() : bundle;
  const venue = toPlainService(bundle.venue, 'venues');
  const menus = (bundle.menus || [])
    .map((service) => toPlainService(service, 'menus'))
    .filter(Boolean);
  const entertainment = (bundle.entertainment || [])
    .map((service) => toPlainService(service, 'entertainment'))
    .filter(Boolean);
  const decorations = (bundle.decorations || [])
    .map((service) => toPlainService(service, 'decorations'))
    .filter(Boolean);
  const derivedPlanItems = [
    toPlanItem(bundle.venue, 'venues'),
    ...(bundle.menus || []).map((service) => toPlanItem(service, 'menus')),
    ...(bundle.entertainment || []).map((service) =>
      toPlanItem(service, 'entertainment'),
    ),
    ...(bundle.decorations || []).map((service) =>
      toPlanItem(service, 'decorations'),
    ),
  ].filter(Boolean);

  return {
    ...bundleObject,
    components: {
      venue,
      menus,
      entertainment,
      decorations,
    },
    planItems: derivedPlanItems.length
      ? derivedPlanItems
      : bundleObject.planItems || [],
  };
}

async function populateBundle(bundle) {
  return bundle.populate(POPULATE_BUNDLE_COMPONENTS);
}

const listBundles = asyncHandler(async (request, response) => {
  const bundles = await Bundle.find(request.query)
    .sort({ createdAt: -1 })
    .populate(POPULATE_BUNDLE_COMPONENTS);

  response.status(200).json({
    message: 'Bundle list fetched successfully',
    data: bundles.map(presentBundle),
  });
});

const getBundleById = asyncHandler(async (request, response) => {
  const bundle = await Bundle.findOne(buildIdFilter(request.params.id)).populate(
    POPULATE_BUNDLE_COMPONENTS,
  );

  if (!bundle) {
    throw new ApiError(404, 'Bundle item not found');
  }

  response.status(200).json({
    message: 'Bundle item fetched successfully',
    data: presentBundle(bundle),
  });
});

const createBundle = asyncHandler(async (request, response) => {
  const payload = normalizeServicePayload(request.body);
  const shouldValidateComponents = hasBundleComponentFields(request.body);
  const normalizedPayload = await normalizeBundleComponents(
    payload,
    shouldValidateComponents,
  );
  const bundle = await Bundle.create(normalizedPayload);
  await populateBundle(bundle);

  response.status(201).json({
    message: 'Bundle item created successfully',
    data: presentBundle(bundle),
  });
});

const updateBundle = asyncHandler(async (request, response) => {
  const payload = normalizeServicePayload(request.body);
  const bundle = await Bundle.findOne(buildIdFilter(request.params.id));

  if (!bundle) {
    throw new ApiError(404, 'Bundle item not found');
  }

  const normalizedPayload = await normalizeBundleComponents(payload, false);
  Object.assign(bundle, normalizedPayload);
  await bundle.save();
  await populateBundle(bundle);

  response.status(200).json({
    message: 'Bundle item updated successfully',
    data: presentBundle(bundle),
  });
});

const removeBundle = asyncHandler(async (request, response) => {
  const bundle = await Bundle.findOneAndDelete(buildIdFilter(request.params.id));

  if (!bundle) {
    throw new ApiError(404, 'Bundle item not found');
  }

  response.status(200).json({
    message: 'Bundle item deleted successfully',
    data: {
      id: bundle.id,
      type: 'bundle',
    },
  });
});

module.exports = {
  createBundle,
  getBundleById,
  listBundles,
  removeBundle,
  updateBundle,
};
