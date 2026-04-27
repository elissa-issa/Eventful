const express = require('express');
const cartController = require('../controllers/cartController');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/add', cartController.addItem);
router.put('/update', cartController.updateItem);
router.delete('/remove/:id', cartController.removeItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;
