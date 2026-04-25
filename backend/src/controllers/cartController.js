const Cart = require('../models/Cart');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
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

function normalizeQuantity(value, fallback = 1) {
  const quantity = Number(value ?? fallback);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ApiError(400, 'quantity must be a positive integer');
  }

  return quantity;
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

async function buildCartResponse(cart) {
  const items = await attachServiceDetails(cart.items);

  return {
    id: cart.id,
    user: cart.user.toString(),
    items,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

const getCart = asyncHandler(async (request, response) => {
  const cart = await findOrCreateCart(request.user.id);

  response.status(200).json({
    message: 'Cart fetched successfully',
    data: await buildCartResponse(cart),
  });
});

const addItem = asyncHandler(async (request, response) => {
  const {
    serviceId,
    serviceType,
    selectedDate,
    customOptions = {},
  } = request.body;
  const quantity = normalizeQuantity(request.body.quantity);

  validateServiceType(serviceType);
  validateObjectId(serviceId);
  await getServiceByType(serviceType, serviceId);

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
  const { serviceId, serviceType, selectedDate, customOptions } = request.body;
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

  item.quantity = quantity;

  if (selectedDate !== undefined) {
    item.selectedDate = parseSelectedDate(selectedDate);
  }

  if (customOptions !== undefined) {
    item.customOptions = customOptions;
  }

  await cart.save();

  response.status(200).json({
    message: 'Cart item updated successfully',
    data: await buildCartResponse(cart),
  });
});

const removeItem = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const serviceType = request.query.serviceType || request.body.serviceType;

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

  response.status(200).json({
    message: 'Cart item removed successfully',
    data: await buildCartResponse(cart),
  });
});

const clearCart = asyncHandler(async (request, response) => {
  const cart = await findOrCreateCart(request.user.id);
  cart.items = [];
  await cart.save();

  response.status(200).json({
    message: 'Cart cleared successfully',
    data: await buildCartResponse(cart),
  });
});

module.exports = {
  addItem,
  clearCart,
  getCart,
  removeItem,
  updateItem,
};
