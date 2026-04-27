const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const {
  attachServiceDetails,
  getServiceByType,
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

  const cart = await Cart.findOne({ user: request.user.id });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cannot checkout an empty cart');
  }

  const { orderItems, totalPrice } = await buildOrderItems(cart.items);
  const order = await Order.create({
    user: request.user.id,
    items: orderItems,
    totalPrice,
    status,
    paymentMethod,
  });

  cart.items = [];
  await cart.save();

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
