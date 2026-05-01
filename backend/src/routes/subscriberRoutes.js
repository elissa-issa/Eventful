const express = require('express');
const subscriberController = require('../controllers/subscriberController');
const { optionalAuth } = require('../middleware/optionalAuth');

const router = express.Router();

router.post('/', optionalAuth, subscriberController.createSubscriber);

module.exports = router;
