const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { ApiError } = require('../helpers/apiError');
const { asyncHandler } = require('../helpers/asyncHandler');
const {
  assertServiceNotDoubleBooked,
  getBookingDateKeys,
} = require('../helpers/venueAvailability');
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

function getCartItemSchedule(cartItem) {
  const customOptions = cartItem.customOptions || {};
  const selectedDate = cartItem.selectedDate || customOptions.selectedDate;
  const selectedEndDate = customOptions.selectedEndDate;
  const selectedTime = customOptions.selectedTime;

  return { selectedDate, selectedEndDate, selectedTime };
}

const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

function getPromotionAmount(cartItem, service, selectedDate, dayCount = 1) {
  const discountLabel = String(service.discountLabel || '').trim();
  const quantity = cartItem.serviceType === 'venues' ? 1 : cartItem.quantity;
  const unitPrice = service.priceValue || 0;
  const lineTotal = unitPrice * quantity * dayCount;

  if (!discountLabel || lineTotal <= 0) {
    return 0;
  }

  const quantityMatch = discountLabel.match(/(\d+)%\s*off\s*for\s*(\d+)\+/i);

  if (quantityMatch) {
    const percentage = Number(quantityMatch[1]);
    const minQuantity = Number(quantityMatch[2]);

    return quantity >= minQuantity ? lineTotal * (percentage / 100) : 0;
  }

  const weekdayMatch = discountLabel.match(/(\d+)%\s*off\s*on\s*([a-z]+)/i);

  if (weekdayMatch) {
    const date = new Date(selectedDate);
    const percentage = Number(weekdayMatch[1]);
    const weekday = weekdayMatch[2].toLowerCase();

    if (!Number.isNaN(date.getTime()) && WEEKDAYS[date.getDay()] === weekday) {
      return lineTotal * (percentage / 100);
    }

    return 0;
  }

  const freeUnitsMatch = discountLabel.match(/buy\s*(\d+)\s*get\s*(\d+)\s*for\s*free/i);

  if (freeUnitsMatch) {
    const buyQuantity = Number(freeUnitsMatch[1]);
    const freeQuantity = Number(freeUnitsMatch[2]);
    const bundleSize = buyQuantity + freeQuantity;

    if (bundleSize <= 0 || quantity < bundleSize) {
      return 0;
    }

    return Math.floor(quantity / bundleSize) * freeQuantity * unitPrice * dayCount;
  }

  return 0;
}

function getBookedDayCount(serviceType, selectedDate, selectedEndDate) {
  if (serviceType !== 'venues' && serviceType !== 'entertainment') {
    return 1;
  }

  return Math.max(getBookingDateKeys(selectedDate, selectedEndDate).length, 1);
}

async function buildOrderItems(cartItems) {
  const orderItems = [];
  let totalPrice = 0;

  for (const cartItem of cartItems) {
    const { selectedDate, selectedEndDate, selectedTime } = getCartItemSchedule(cartItem);

    const usesDateRangeOnly =
      cartItem.serviceType === 'venues' || cartItem.serviceType === 'entertainment';

    if (!selectedDate || (!usesDateRangeOnly && !selectedTime)) {
      throw new ApiError(
        400,
        usesDateRangeOnly
          ? 'Each venue and entertainment item must have a start date before checkout'
          : 'Each cart item must have a selected date and time before checkout',
      );
    }

    if (usesDateRangeOnly && selectedDate) {
      await assertServiceNotDoubleBooked(
        cartItem.serviceType,
        cartItem.serviceId,
        selectedDate,
        selectedEndDate,
      );
    }

    const service = await getServiceByType(
      cartItem.serviceType,
      cartItem.serviceId,
    );
    const quantity = cartItem.quantity;
    const priceQuantity = cartItem.serviceType === 'venues' ? 1 : quantity;

    if (cartItem.serviceType === 'menus' || cartItem.serviceType === 'venues') {
      const min = service.minGuests ?? null;
      const max = service.maxGuests ?? null;
      if (min !== null && quantity < min) throw new ApiError(400, `Minimum quantity for this item is ${min}`);
      if (max !== null && quantity > max) throw new ApiError(400, `Maximum quantity for this item is ${max}`);
    } else if (cartItem.serviceType === 'decorations') {
      const min = service.minQuantity ?? null;
      const max = service.maxQuantity ?? null;
      if (min !== null && quantity < min) throw new ApiError(400, `Minimum quantity for this item is ${min}`);
      if (max !== null && quantity > max) throw new ApiError(400, `Maximum quantity for this item is ${max}`);
    }
    const unitPrice = service.priceValue || 0;
    const dayCount = getBookedDayCount(cartItem.serviceType, selectedDate, selectedEndDate);
    const retailLineTotal = unitPrice * priceQuantity * dayCount;
    const promotionAmount = Math.min(
      getPromotionAmount(cartItem, service, selectedDate, dayCount),
      retailLineTotal,
    );
    const lineTotal = retailLineTotal - promotionAmount;

    orderItems.push({
      serviceId: cartItem.serviceId,
      serviceType: cartItem.serviceType,
      quantity,
      selectedDate,
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

  if (!['pending', 'paid', 'processing', 'completed', 'delivered', 'cancelled'].includes(status)) {
    throw new ApiError(
      400,
      'status must be one of: pending, paid, processing, completed, delivered, cancelled',
    );
  }

  let cart = await Cart.findOne({ user: request.user.id });
  let cartItems = cart?.items || [];
  let checkoutCollection = null;

  if (request.body.collectionId) {
    validateObjectId(request.body.collectionId, 'collectionId');
    checkoutCollection = await findOwnedCollection(request.user.id, request.body.collectionId);
    cartItems = await Promise.all(
      checkoutCollection.items.map(async (item) => {
        const service = await getServiceByType(item.section, item.itemId);

        return {
          serviceId: service._id,
          serviceType: item.section,
          quantity: item.quantity,
          selectedDate: item.selectedOptions?.selectedDate || null,
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

  if (checkoutCollection) {
    checkoutCollection.status = 'checked_out';
    checkoutCollection.checkedOutAt = new Date();
    await checkoutCollection.save();
  }

  if (cart) {
    cart.items = [];
    cart.selectedCollection = null;
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
