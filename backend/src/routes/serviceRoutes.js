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

const router = express.Router();

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

router.get(
  '/venues/:id/booked-dates',
  asyncHandler(async (req, res) => {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      throw new ApiError(404, 'Venue not found');
    }

    const orders = await Order.find({
      status: { $ne: 'cancelled' },
      'items.serviceType': 'venues',
      'items.serviceId': venue._id,
    });

    const bookedDates = new Set();

    for (const order of orders) {
      for (const item of order.items) {
        if (
          item.serviceType === 'venues' &&
          item.serviceId.equals(venue._id) &&
          item.selectedDate
        ) {
          const d = new Date(item.selectedDate);
          const dateStr = [
            d.getUTCFullYear(),
            String(d.getUTCMonth() + 1).padStart(2, '0'),
            String(d.getUTCDate()).padStart(2, '0'),
          ].join('-');
          bookedDates.add(dateStr);
        }
      }
    }

    res.json({ data: Array.from(bookedDates) });
  }),
);

router.get('/bundles', listBundles);
router.get('/bundles/:id', getBundleById);
router.post('/bundles', createBundle);
router.put('/bundles/:id', updateBundle);
router.patch('/bundles/:id', updateBundle);
router.delete('/bundles/:id', removeBundle);

module.exports = router;
