const express = require('express');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/from-collection/:collectionId', cartController.createFromCollection);
router.post('/from-plan/:planId', cartController.createFromPlan);
router.post('/add', cartController.addItem);
router.put('/update', cartController.updateItem);
router.patch('/items/:cartItemId', cartController.updateItemById);
router.delete('/items/:cartItemId', cartController.removeItemById);
router.post('/checkout', orderController.checkout);
router.delete('/remove/:id', cartController.removeItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;
