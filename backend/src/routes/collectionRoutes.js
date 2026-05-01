const express = require('express');
const collectionController = require('../controllers/collectionController');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/', collectionController.listCollections);
router.post('/', collectionController.createCollection);
router.get('/:collectionId', collectionController.getCollection);
router.patch('/:collectionId', collectionController.updateCollection);
router.delete('/:collectionId', collectionController.deleteCollection);
router.post('/:collectionId/items', collectionController.addItem);
router.patch('/:collectionId/items/:itemId', collectionController.updateItem);
router.delete('/:collectionId/items/:itemId', collectionController.removeItem);

module.exports = router;
