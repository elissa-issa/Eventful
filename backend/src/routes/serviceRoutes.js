const express = require('express');
const Bundle = require('../models/Bundle');
const Decoration = require('../models/Decoration');
const Entertainment = require('../models/Entertainment');
const Menu = require('../models/Menu');
const Venue = require('../models/Venue');
const { createServiceController } = require('../controllers/serviceController');
const { createServiceRepository } = require('../repository/serviceRepository');

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
attachCrudRoutes('/bundles', Bundle, 'Bundle');

module.exports = router;
