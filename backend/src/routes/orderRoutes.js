const express = require('express');
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.post('/checkout', orderController.checkout);
router.get('/', orderController.getOrders);

module.exports = router;
