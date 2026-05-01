const Collection = require('../models/Collection');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const {
  attachServiceDetails,
  getServiceByType,
  validateObjectId,
  validateServiceId,
  validateServiceType,
} = require('../helpers/serviceResolver');

function normalizeQuantity(value, fallback = 1) {
  const quantity = Number(value ?? fallback);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ApiError(400, 'quantity must be a positive integer');
  }

  return quantity;
}

function getCollectionId(request) {
  const { collectionId } = request.params;
  validateObjectId(collectionId, 'collectionId');
  return collectionId;
}

function activeCollectionFilter() {
  return {
    $or: [{ status: 'active' }, { status: { $exists: false } }],
  };
}

async function findOwnedCollection(userId, collectionId) {
  const collection = await Collection.findOne({
    _id: collectionId,
    user: userId,
    ...activeCollectionFilter(),
  });

  if (!collection) {
    throw new ApiError(404, 'Collection not found');
  }

  return collection;
}

function buildSnapshot(service, body = {}) {
  return {
    pricingSnapshot: body.pricingSnapshot || {
      priceValue: service.priceValue,
      priceText: service.priceText,
    },
    titleSnapshot: body.titleSnapshot || service.title || '',
    imageSnapshot: body.imageSnapshot || service.imageSrc || '',
    vendorSnapshot: body.vendorSnapshot || service.vendorName || '',
    priceTextSnapshot: body.priceTextSnapshot || service.priceText || '',
  };
}

async function normalizeCollectionItem(body) {
  const section = body.section || body.serviceType;
  const rawItemId = body.itemId || body.serviceId;

  validateServiceType(section);
  validateServiceId(String(rawItemId || ''), 'itemId');

  const service = await getServiceByType(section, rawItemId);

  return {
    section,
    itemId: service.itemId || service.id,
    quantity: normalizeQuantity(body.quantity),
    selectedOptions: body.selectedOptions || body.customOptions || {},
    ...buildSnapshot(service, body),
  };
}

async function buildCollectionResponse(collection) {
  const compatibleItems = collection.items.map((item) => {
    const itemObject = item.toObject ? item.toObject() : item;
    return {
      ...itemObject,
      serviceType: itemObject.section,
      serviceId: itemObject.itemId,
      customOptions: itemObject.selectedOptions || {},
    };
  });
  const enrichedItems = await attachServiceDetails(compatibleItems);
  const items = enrichedItems.map((item) => ({
    id: item._id?.toString?.() || item.id,
    section: item.section || item.serviceType,
    itemId: item.itemId || item.serviceId,
    serviceType: item.section || item.serviceType,
    serviceId: item.itemId || item.serviceId,
    quantity: item.quantity,
    selectedOptions: item.selectedOptions || item.customOptions || {},
    pricingSnapshot: item.pricingSnapshot || {},
    titleSnapshot: item.titleSnapshot || '',
    imageSnapshot: item.imageSnapshot || '',
    vendorSnapshot: item.vendorSnapshot || '',
    priceTextSnapshot: item.priceTextSnapshot || '',
    addedAt: item.addedAt,
    service: item.service,
  }));

  return {
    id: collection.id,
    user: collection.user.toString(),
    name: collection.name,
    title: collection.name,
    description: collection.description,
    status: collection.status || 'active',
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    previewItems: items.slice(0, 4).map((item) => ({
      id: `${item.section}:${item.itemId}`,
      imageSrc: item.service?.imageSrc || item.imageSnapshot,
      imageAlt: item.service?.imageAlt || item.titleSnapshot || item.section,
    })),
    items,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
}

const listCollections = asyncHandler(async (request, response) => {
  const collections = await Collection.find({
    user: request.user.id,
    ...activeCollectionFilter(),
  }).sort({ updatedAt: -1 });
  const data = await Promise.all(collections.map(buildCollectionResponse));

  response.status(200).json({
    message: 'Collections fetched successfully',
    data,
  });
});

const createCollection = asyncHandler(async (request, response) => {
  const name = String(request.body.name || '').trim();

  if (!name) {
    throw new ApiError(400, 'name is required');
  }

  const collection = await Collection.create({
    user: request.user.id,
    name,
    description: String(request.body.description || '').trim(),
    status: 'active',
    items: [],
  });

  response.status(201).json({
    message: 'Collection created successfully',
    data: await buildCollectionResponse(collection),
  });
});

const getCollection = asyncHandler(async (request, response) => {
  const collection = await findOwnedCollection(request.user.id, getCollectionId(request));

  response.status(200).json({
    message: 'Collection fetched successfully',
    data: await buildCollectionResponse(collection),
  });
});

const updateCollection = asyncHandler(async (request, response) => {
  const collection = await findOwnedCollection(request.user.id, getCollectionId(request));

  if (request.body.name !== undefined) {
    const name = String(request.body.name || '').trim();

    if (!name) {
      throw new ApiError(400, 'name cannot be empty');
    }

    collection.name = name;
  }

  if (request.body.description !== undefined) {
    collection.description = String(request.body.description || '').trim();
  }

  await collection.save();

  response.status(200).json({
    message: 'Collection updated successfully',
    data: await buildCollectionResponse(collection),
  });
});

const deleteCollection = asyncHandler(async (request, response) => {
  const collection = await findOwnedCollection(request.user.id, getCollectionId(request));
  await collection.deleteOne();

  response.status(200).json({
    message: 'Collection deleted successfully',
    data: { id: collection.id },
  });
});

const addItem = asyncHandler(async (request, response) => {
  const collection = await findOwnedCollection(request.user.id, getCollectionId(request));
  const itemPayload = await normalizeCollectionItem(request.body);
  const existingItem = collection.items.find(
    (item) => item.section === itemPayload.section && item.itemId === itemPayload.itemId,
  );

  if (existingItem) {
    existingItem.quantity += itemPayload.quantity;
    existingItem.selectedOptions = {
      ...(existingItem.selectedOptions || {}),
      ...(itemPayload.selectedOptions || {}),
    };
    existingItem.pricingSnapshot = itemPayload.pricingSnapshot;
    existingItem.titleSnapshot = itemPayload.titleSnapshot;
    existingItem.imageSnapshot = itemPayload.imageSnapshot;
    existingItem.vendorSnapshot = itemPayload.vendorSnapshot;
    existingItem.priceTextSnapshot = itemPayload.priceTextSnapshot;
  } else {
    collection.items.push(itemPayload);
  }

  await collection.save();

  response.status(200).json({
    message: existingItem
      ? 'Collection item quantity updated successfully'
      : 'Collection item added successfully',
    data: await buildCollectionResponse(collection),
  });
});

const updateItem = asyncHandler(async (request, response) => {
  const collection = await findOwnedCollection(request.user.id, getCollectionId(request));
  const { itemId } = request.params;
  const section = request.body?.section || request.query.section;

  validateServiceType(section);
  validateServiceId(itemId, 'itemId');

  const item = collection.items.find(
    (collectionItem) => collectionItem.section === section && collectionItem.itemId === itemId,
  );

  if (!item) {
    throw new ApiError(404, 'Collection item not found');
  }

  if (request.body.quantity !== undefined) {
    item.quantity = normalizeQuantity(request.body.quantity);
  }

  if (request.body.selectedOptions !== undefined || request.body.customOptions !== undefined) {
    item.selectedOptions = request.body.selectedOptions || request.body.customOptions || {};
  }

  await collection.save();

  response.status(200).json({
    message: 'Collection item updated successfully',
    data: await buildCollectionResponse(collection),
  });
});

const removeItem = asyncHandler(async (request, response) => {
  const collection = await findOwnedCollection(request.user.id, getCollectionId(request));
  const { itemId } = request.params;
  const section = request.body?.section || request.query.section;

  validateServiceType(section);
  validateServiceId(itemId, 'itemId');

  const initialItemCount = collection.items.length;
  collection.items = collection.items.filter(
    (item) => !(item.section === section && item.itemId === itemId),
  );

  if (collection.items.length === initialItemCount) {
    throw new ApiError(404, 'Collection item not found');
  }

  await collection.save();

  response.status(200).json({
    message: 'Collection item removed successfully',
    data: await buildCollectionResponse(collection),
  });
});

module.exports = {
  addItem,
  buildCollectionResponse,
  createCollection,
  deleteCollection,
  findOwnedCollection,
  getCollection,
  listCollections,
  removeItem,
  updateCollection,
  updateItem,
};
