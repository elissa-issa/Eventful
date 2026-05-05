const Cart = require('../models/Cart');
const CustomizedPlan = require('../models/CustomizedPlan');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const { assertServiceNotDoubleBooked } = require('../helpers/venueAvailability');
const {
  buildCollectionResponse,
  findOwnedCollection,
} = require('./collectionController');
const {
  attachServiceDetails,
  getServiceByType,
  validateObjectId,
  validateServiceType,
} = require('../helpers/serviceResolver');


async function findOrCreateCart(userId) {
  return Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { returnDocument: 'after', upsert: true },
  );
}

async function copyCollectionToCart(userId, collectionId) {
  validateObjectId(collectionId, 'collectionId');
  const collection = await findOwnedCollection(userId, collectionId);
  const cartItems = [];

  for (const item of collection.items) {
    const service = await getServiceByType(item.section, item.itemId);
    cartItems.push({
      serviceId: service._id,
      serviceType: item.section,
      quantity: item.quantity,
      selectedDate: parseSelectedDate(item.selectedOptions?.selectedDate),
      customOptions: item.selectedOptions || {},
    });
  }

  const cart = await findOrCreateCart(userId);
  cart.selectedCollection = collection._id;
  cart.items = cartItems;
  await cart.save();

  return { cart, collection };
}

async function copyPlanToCart(userId, planId) {
  validateObjectId(planId, 'planId');
  const plan = await CustomizedPlan.findOne({ _id: planId, user: userId });

  if (!plan) {
    throw new ApiError(404, 'Customized plan not found');
  }

  const cartItems = [];

  for (const item of plan.items) {
    const service = await getServiceByType(item.section, item.itemId);
    cartItems.push({
      serviceId: service._id,
      serviceType: item.section,
      quantity: item.quantity,
      selectedDate: parseSelectedDate(item.selectedOptions?.selectedDate),
      customOptions: item.selectedOptions || {},
    });
  }

  const cart = await findOrCreateCart(userId);
  cart.selectedCollection = null;
  cart.items = cartItems;
  await cart.save();

  return { cart, plan };
}

function normalizeQuantity(value, fallback = 1) {
  const quantity = Number(value ?? fallback);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ApiError(400, 'quantity must be a positive integer');
  }

  return quantity;
}

function validateQuantityBounds(quantity, service, serviceType) {
  let min = null;
  let max = null;

  if (serviceType === 'menus' || serviceType === 'venues') {
    min = service.minGuests ?? null;
    max = service.maxGuests ?? null;
  } else if (serviceType === 'decorations') {
    min = service.minQuantity ?? null;
    max = service.maxQuantity ?? null;
  }

  if (min !== null && quantity < min) {
    throw new ApiError(400, `Minimum quantity for this item is ${min}`);
  }

  if (max !== null && quantity > max) {
    throw new ApiError(400, `Maximum quantity for this item is ${max}`);
  }
}

function parseSelectedDate(value) {
  if (!value) {
    return null;
  }

  const selectedDate = new Date(value);

  if (Number.isNaN(selectedDate.getTime())) {
    throw new ApiError(400, 'selectedDate must be a valid date');
  }

  return selectedDate;
}

function buildSelectedOptionsWithDate(customOptions = {}, selectedDate) {
  const selectedOptions = {
    ...(customOptions || {}),
  };

  if (selectedDate) {
    selectedOptions.selectedDate = selectedDate;
  } else {
    delete selectedOptions.selectedDate;
  }

  return selectedOptions;
}

function normalizeCustomOptionsForService(serviceType, customOptions = {}) {
  const nextOptions = { ...(customOptions || {}) };

  if (serviceType === 'venues' || serviceType === 'entertainment') {
    delete nextOptions.selectedTime;
  }

  return nextOptions;
}

async function buildCartResponse(cart) {
  const items = await attachServiceDetails(cart.items);

  return {
    id: cart.id,
    user: cart.user.toString(),
    collectionId: cart.selectedCollection ? cart.selectedCollection.toString() : null,
    items,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

const getCart = asyncHandler(async (request, response) => {
  const { collectionId } = request.query;
  const { cart, collection } = collectionId
    ? await copyCollectionToCart(request.user.id, collectionId)
    : { cart: await findOrCreateCart(request.user.id), collection: null };

  response.status(200).json({
    message: 'Cart fetched successfully',
    data: {
      ...(await buildCartResponse(cart)),
      collection: collection ? await buildCollectionResponse(collection) : null,
    },
  });
});

const createFromCollection = asyncHandler(async (request, response) => {
  const { cart, collection } = await copyCollectionToCart(
    request.user.id,
    request.params.collectionId,
  );

  response.status(200).json({
    message: 'Cart created from collection successfully',
    data: {
      ...(await buildCartResponse(cart)),
      collection: await buildCollectionResponse(collection),
    },
  });
});

const createFromPlan = asyncHandler(async (request, response) => {
  const { cart, plan } = await copyPlanToCart(request.user.id, request.params.planId);

  response.status(200).json({
    message: 'Cart created from customized plan successfully',
    data: {
      ...(await buildCartResponse(cart)),
      plan: {
        id: plan.id,
        name: plan.name,
      },
    },
  });
});

const addItem = asyncHandler(async (request, response) => {
  const {
    serviceId,
    serviceType,
    selectedDate,
  } = request.body;
  const customOptions = normalizeCustomOptionsForService(serviceType, request.body.customOptions);
  const quantity = normalizeQuantity(request.body.quantity);

  validateServiceType(serviceType);
  validateObjectId(serviceId);
  const service = await getServiceByType(serviceType, serviceId);

  validateQuantityBounds(quantity, service, serviceType);

  if ((serviceType === 'venues' || serviceType === 'entertainment') && selectedDate) {
    await assertServiceNotDoubleBooked(
      serviceType,
      service._id,
      parseSelectedDate(selectedDate),
      customOptions?.selectedEndDate,
    );
  }

  const cart = await findOrCreateCart(request.user.id);
  const existingItem = cart.items.find(
    (item) =>
      item.serviceType === serviceType &&
      item.serviceId.toString() === serviceId,
  );

  if (existingItem) {
    existingItem.quantity += quantity;

    if (selectedDate !== undefined) {
      existingItem.selectedDate = parseSelectedDate(selectedDate);
    }

    if (customOptions && typeof customOptions === 'object') {
      existingItem.customOptions = {
        ...(existingItem.customOptions || {}),
        ...customOptions,
      };

      if (serviceType === 'venues' || serviceType === 'entertainment') {
        delete existingItem.customOptions.selectedTime;
      }
    }
  } else {
    cart.items.push({
      serviceId,
      serviceType,
      quantity,
      selectedDate: parseSelectedDate(selectedDate),
      customOptions,
    });
  }

  await cart.save();

  response.status(200).json({
    message: 'Cart item added successfully',
    data: await buildCartResponse(cart),
  });
});

const updateItem = asyncHandler(async (request, response) => {
  const { serviceId, selectedDate, customOptions } = request.body;
  const serviceType = request.body.serviceType || request.body.section;
  const normalizedCustomOptions = normalizeCustomOptionsForService(serviceType, customOptions);
  const quantity = normalizeQuantity(request.body.quantity);

  validateServiceType(serviceType);
  validateObjectId(serviceId);

  const cart = await findOrCreateCart(request.user.id);
  const item = cart.items.find(
    (cartItem) =>
      cartItem.serviceType === serviceType &&
      cartItem.serviceId.toString() === serviceId,
  );

  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  let service = null;

  if (['menus', 'decorations', 'venues', 'entertainment'].includes(serviceType)) {
    service = await getServiceByType(serviceType, serviceId);
    validateQuantityBounds(quantity, service, serviceType);

    if ((serviceType === 'venues' || serviceType === 'entertainment') && selectedDate) {
      await assertServiceNotDoubleBooked(
        serviceType,
        service._id,
        parseSelectedDate(selectedDate),
        normalizedCustomOptions?.selectedEndDate,
      );
    }
  }

  item.quantity = quantity;

  if (selectedDate !== undefined) {
    item.selectedDate = parseSelectedDate(selectedDate);
  }

  if (customOptions !== undefined) {
    item.customOptions = normalizedCustomOptions;
  }

  await cart.save();

  if (cart.selectedCollection) {
    if (!service) {
      service = await getServiceByType(serviceType, serviceId);
    }
    const itemId = service.itemId || service.id;
    const collection = await findOwnedCollection(request.user.id, cart.selectedCollection);
    const syncedItem = collection.items.find(
      (candidate) => candidate.section === serviceType && candidate.itemId === itemId,
    );

    if (syncedItem) {
      syncedItem.quantity = quantity;
      syncedItem.selectedOptions = buildSelectedOptionsWithDate(
        customOptions !== undefined
          ? normalizedCustomOptions
          : syncedItem.selectedOptions || {},
        item.selectedDate,
      );
      await collection.save();
    }
  }

  response.status(200).json({
    message: 'Cart item updated successfully',
    data: await buildCartResponse(cart),
  });
});

const updateItemById = asyncHandler(async (request, response) => {
  validateObjectId(request.params.cartItemId, 'cartItemId');
  const cart = await findOrCreateCart(request.user.id);
  const item = cart.items.id(request.params.cartItemId);

  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  const quantity = normalizeQuantity(request.body.quantity);
  const normalizedCustomOptions = normalizeCustomOptionsForService(
    item.serviceType,
    request.body.customOptions,
  );

  let service = null;

  if (['menus', 'decorations', 'venues', 'entertainment'].includes(item.serviceType)) {
    service = await getServiceByType(item.serviceType, item.serviceId);
    validateQuantityBounds(quantity, service, item.serviceType);

    if (
      (item.serviceType === 'venues' || item.serviceType === 'entertainment') &&
      request.body.selectedDate
    ) {
      await assertServiceNotDoubleBooked(
        item.serviceType,
        service._id,
        parseSelectedDate(request.body.selectedDate),
        normalizedCustomOptions?.selectedEndDate,
      );
    }
  }

  item.quantity = quantity;

  if (request.body.selectedDate !== undefined) {
    item.selectedDate = parseSelectedDate(request.body.selectedDate);
  }

  if (request.body.customOptions !== undefined) {
    item.customOptions = normalizedCustomOptions;
  }

  await cart.save();

  if (cart.selectedCollection) {
    if (!service) {
      service = await getServiceByType(item.serviceType, item.serviceId);
    }
    const collection = await findOwnedCollection(request.user.id, cart.selectedCollection);
    const syncedItem = collection.items.find(
      (candidate) =>
        candidate.section === item.serviceType &&
        candidate.itemId === (service.itemId || service.id),
    );

    if (syncedItem) {
      syncedItem.quantity = quantity;
      syncedItem.selectedOptions = buildSelectedOptionsWithDate(
        item.customOptions || {},
        item.selectedDate,
      );
      await collection.save();
    }
  }

  response.status(200).json({
    message: 'Cart item updated successfully',
    data: await buildCartResponse(cart),
  });
});

const removeItem = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const serviceType = request.query.serviceType || request.body?.serviceType;

  validateServiceType(serviceType);
  validateObjectId(id, 'id');

  const cart = await findOrCreateCart(request.user.id);
  const initialItemCount = cart.items.length;
  cart.items = cart.items.filter(
    (item) =>
      !(
        item.serviceType === serviceType &&
        item.serviceId.toString() === id
      ),
  );

  if (cart.items.length === initialItemCount) {
    throw new ApiError(404, 'Cart item not found');
  }

  await cart.save();

  if (cart.selectedCollection) {
    const service = await getServiceByType(serviceType, id);
    const collection = await findOwnedCollection(request.user.id, cart.selectedCollection);
    collection.items = collection.items.filter(
      (item) =>
        !(item.section === serviceType && item.itemId === (service.itemId || service.id)),
    );
    await collection.save();
  }

  response.status(200).json({
    message: 'Cart item removed successfully',
    data: await buildCartResponse(cart),
  });
});

const removeItemById = asyncHandler(async (request, response) => {
  validateObjectId(request.params.cartItemId, 'cartItemId');
  const cart = await findOrCreateCart(request.user.id);
  const item = cart.items.id(request.params.cartItemId);

  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  const service = await getServiceByType(item.serviceType, item.serviceId);
  const serviceType = item.serviceType;
  const itemId = service.itemId || service.id;
  item.deleteOne();
  await cart.save();

  if (cart.selectedCollection) {
    const collection = await findOwnedCollection(request.user.id, cart.selectedCollection);
    collection.items = collection.items.filter(
      (candidate) => !(candidate.section === serviceType && candidate.itemId === itemId),
    );
    await collection.save();
  }

  response.status(200).json({
    message: 'Cart item removed successfully',
    data: await buildCartResponse(cart),
  });
});

const clearCart = asyncHandler(async (request, response) => {
  const cart = await findOrCreateCart(request.user.id);
  cart.items = [];
  cart.selectedCollection = null;
  await cart.save();

  response.status(200).json({
    message: 'Cart cleared successfully',
    data: await buildCartResponse(cart),
  });
});

module.exports = {
  addItem,
  clearCart,
  createFromCollection,
  createFromPlan,
  getCart,
  removeItem,
  removeItemById,
  updateItem,
  updateItemById,
};
