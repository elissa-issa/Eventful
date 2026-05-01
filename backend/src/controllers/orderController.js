const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const { findOwnedCollection } = require('./collectionController');
const {
  attachServiceDetails,
  getServiceByType,
  validateObjectId,
} = require('../helpers/serviceResolver');

async function buildOrderResponse(order) {
  const items = await attachServiceDetails(order.items);

  return {
    id: order.id,
    user: order.user.toString(),
    items,
    totalPrice: order.totalPrice,
    status: order.status,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

async function buildOrderItems(cartItems) {
  const orderItems = [];
  let totalPrice = 0;

  for (const cartItem of cartItems) {
    const service = await getServiceByType(
      cartItem.serviceType,
      cartItem.serviceId,
    );
    const quantity = cartItem.quantity;
    const unitPrice = service.priceValue || 0;
    const lineTotal = unitPrice * quantity;

    orderItems.push({
      serviceId: cartItem.serviceId,
      serviceType: cartItem.serviceType,
      quantity,
      selectedDate: cartItem.selectedDate,
      customOptions: cartItem.customOptions || {},
      unitPrice,
      lineTotal,
    });

    totalPrice += lineTotal;
  }

  return { orderItems, totalPrice };
}

const checkout = asyncHandler(async (request, response) => {
  const paymentMethod = String(request.body.paymentMethod || '').trim();
  const status = request.body.status || 'pending';

  if (!paymentMethod) {
    throw new ApiError(400, 'paymentMethod is required');
  }

  if (!['pending', 'paid', 'completed'].includes(status)) {
    throw new ApiError(400, 'status must be one of: pending, paid, completed');
  }

  let cart = await Cart.findOne({ user: request.user.id });
  let cartItems = cart?.items || [];

  if (request.body.collectionId) {
    validateObjectId(request.body.collectionId, 'collectionId');
    const collection = await findOwnedCollection(request.user.id, request.body.collectionId);
    cartItems = await Promise.all(
      collection.items.map(async (item) => {
        const service = await getServiceByType(item.section, item.itemId);

        return {
          serviceId: service._id,
          serviceType: item.section,
          quantity: item.quantity,
          selectedDate: null,
          customOptions: item.selectedOptions || {},
        };
      }),
    );
  }

  if (cartItems.length === 0) {
    throw new ApiError(400, 'Cannot checkout an empty cart');
  }

  const { orderItems, totalPrice } = await buildOrderItems(cartItems);
  const order = await Order.create({
    user: request.user.id,
    items: orderItems,
    totalPrice,
    status,
    paymentMethod,
  });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  response.status(201).json({
    message: 'Order created successfully',
    data: await buildOrderResponse(order),
  });
});

const getOrders = asyncHandler(async (request, response) => {
  const orders = await Order.find({ user: request.user.id }).sort({
    createdAt: -1,
  });
  const hydratedOrders = await Promise.all(orders.map(buildOrderResponse));

  response.status(200).json({
    message: 'Orders fetched successfully',
    data: hydratedOrders,
  });
});

module.exports = {
  checkout,
  getOrders,
};
