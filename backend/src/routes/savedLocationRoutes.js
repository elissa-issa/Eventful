const express = require('express');
const savedLocationController = require('../controllers/savedLocationController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .post(savedLocationController.createLocation)
  .get(savedLocationController.getLocations);

router
  .route('/:id')
  .get(savedLocationController.getLocation)
  .put(savedLocationController.updateLocation)
  .delete(savedLocationController.deleteLocation);

module.exports = router;
