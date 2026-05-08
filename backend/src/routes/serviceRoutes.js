const express = require('express');
const Decoration = require('../models/Decoration');
const Entertainment = require('../models/Entertainment');
const Menu = require('../models/Menu');
const Order = require('../models/Order');
const Venue = require('../models/Venue');
const {
  createBundle,
  getBundleById,
  listBundles,
  removeBundle,
  updateBundle,
} = require('../controllers/bundleController');
const { createServiceController } = require('../controllers/serviceController');
const { createServiceRepository } = require('../repository/serviceRepository');
const { asyncHandler } = require('../helpers/asyncHandler');
const { ApiError } = require('../helpers/apiError');
const { getBookingDateKeys } = require('../helpers/venueAvailability');

const router = express.Router();

router.get(
  '/unavailable',
  asyncHandler(async (req, res) => {
    const requestedDateKey = req.query.date
      ? getBookingDateKeys(req.query.date)[0]
      : null;

    if (!requestedDateKey) {
      throw new ApiError(400, 'date query parameter must be a valid date');
    }

    const orders = await Order.find({
      status: { $ne: 'cancelled' },
      'items.selectedDate': { $ne: null },
    });
    const unavailableServices = new Set();

    for (const order of orders) {
      for (const item of order.items) {
        if (!item.selectedDate) {
          continue;
        }

        const bookedDateKeys = getBookingDateKeys(
          item.selectedDate,
          item.customOptions?.selectedEndDate,
        );

        if (bookedDateKeys.includes(requestedDateKey)) {
          unavailableServices.add(
            `${item.serviceType}:${item.serviceId.toString()}`,
          );
        }
      }
    }

    res.json({
      data: Array.from(unavailableServices).map((serviceKey) => {
        const [serviceType, serviceId] = serviceKey.split(':');

        return {
          serviceType,
          serviceId,
        };
      }),
    });
  }),
);

function attachCrudRoutes(path, Model, serviceName) {
  const controller = createServiceController(
    createServiceRepository(Model),
    serviceName,
  );

  router.get(path, controller.list);
  router.get(`${path}/:id`, controller.getById);
  router.post(path, controller.create);
  router.put(`${path}/:id`, controller.update);
  router.patch(`${path}/:id`, controller.update);
  router.delete(`${path}/:id`, controller.remove);
}

attachCrudRoutes('/menus', Menu, 'Menu');
attachCrudRoutes('/venues', Venue, 'Venue');
attachCrudRoutes('/decorations', Decoration, 'Decoration');
attachCrudRoutes('/entertainment', Entertainment, 'Entertainment');

function attachBookedDatesRoute(path, Model, serviceType, serviceName) {
  router.get(
    `${path}/:id/booked-dates`,
    asyncHandler(async (req, res) => {
      const service = await Model.findById(req.params.id);

      if (!service) {
        throw new ApiError(404, `${serviceName} not found`);
      }

      const orders = await Order.find({
        status: { $ne: 'cancelled' },
        'items.serviceType': serviceType,
        'items.serviceId': service._id,
      });

      const bookedDates = new Set();

      for (const order of orders) {
        for (const item of order.items) {
          if (
            item.serviceType === serviceType &&
            item.serviceId.equals(service._id) &&
            item.selectedDate
          ) {
            getBookingDateKeys(
              item.selectedDate,
              item.customOptions?.selectedEndDate,
            ).forEach((dateKey) => bookedDates.add(dateKey));
          }
        }
      }

      res.json({ data: Array.from(bookedDates).filter(Boolean) });
    }),
  );
}

attachBookedDatesRoute('/venues', Venue, 'venues', 'Venue');
attachBookedDatesRoute('/entertainment', Entertainment, 'entertainment', 'Entertainment');

router.get('/bundles', listBundles);
router.get('/bundles/:id', getBundleById);
router.post('/bundles', createBundle);
router.put('/bundles/:id', updateBundle);
router.patch('/bundles/:id', updateBundle);
router.delete('/bundles/:id', removeBundle);

module.exports = router;
