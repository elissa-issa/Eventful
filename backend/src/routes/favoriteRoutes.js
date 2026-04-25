const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/', favoriteController.getFavorites);
router.post('/add', favoriteController.addFavorite);
router.post('/toggle', favoriteController.toggleFavorite);
router.delete('/remove/:id', favoriteController.removeFavorite);

module.exports = router;
