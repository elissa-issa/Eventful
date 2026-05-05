const Order = require('../models/Order');
const { ApiError } = require('./apiError');

const APP_TIME_ZONE = 'Asia/Beirut';

function getBookingDateKey(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function getBookingDateKeys(startValue, endValue) {
  const startKey = getBookingDateKey(startValue);
  const endKey = getBookingDateKey(endValue || startValue);

  if (!startKey || !endKey) return [];

  const start = new Date(`${startKey}T00:00:00Z`);
  const end = new Date(`${endKey}T00:00:00Z`);

  if (end < start) {
    throw new ApiError(400, 'selectedEndDate must be on or after selectedDate');
  }

  const keys = [];
  let cursor = start;

  while (cursor <= end) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }

  return keys;
}

async function assertServiceNotDoubleBooked(serviceType, serviceId, selectedDate, selectedEndDate) {
  if (!selectedDate) return;

  const selectedDateKeys = new Set(getBookingDateKeys(selectedDate, selectedEndDate));

  if (selectedDateKeys.size === 0) return;

  const orders = await Order.find({
    status: { $ne: 'cancelled' },
    'items.serviceType': serviceType,
    'items.serviceId': serviceId,
  });

  const conflict = orders.some((order) =>
    order.items.some((item) => {
      if (
        item.serviceType !== serviceType ||
        !item.serviceId.equals(serviceId) ||
        !item.selectedDate
      ) {
        return false;
      }

      const bookedDateKeys = getBookingDateKeys(
        item.selectedDate,
        item.customOptions?.selectedEndDate,
      );

      return bookedDateKeys.some((dateKey) => selectedDateKeys.has(dateKey));
    }),
  );

  if (conflict) {
    throw new ApiError(
      409,
      `This ${serviceType === 'venues' ? 'venue' : 'service'} is already booked for the selected date. Please choose a different date.`,
    );
  }
}

module.exports = {
  assertServiceNotDoubleBooked,
  assertVenueNotDoubleBooked: (serviceId, selectedDate, selectedEndDate) =>
    assertServiceNotDoubleBooked('venues', serviceId, selectedDate, selectedEndDate),
  getBookingDateKey,
  getBookingDateKeys,
  getVenueBookingDateKey: getBookingDateKey,
  getVenueBookingDateKeys: getBookingDateKeys,
};
