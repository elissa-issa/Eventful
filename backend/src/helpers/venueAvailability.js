const Order = require('../models/Order');
const { ApiError } = require('./apiError');

async function assertVenueNotDoubleBooked(serviceId, selectedDate) {
  if (!selectedDate) return;

  const date = new Date(selectedDate);

  if (Number.isNaN(date.getTime())) return;

  const startOfDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const conflict = await Order.findOne({
    status: { $ne: 'cancelled' },
    items: {
      $elemMatch: {
        serviceType: 'venues',
        serviceId,
        selectedDate: { $gte: startOfDay, $lt: endOfDay },
      },
    },
  });

  if (conflict) {
    throw new ApiError(
      409,
      'This venue is already booked for the selected date. Please choose a different date.',
    );
  }
}

module.exports = { assertVenueNotDoubleBooked };
