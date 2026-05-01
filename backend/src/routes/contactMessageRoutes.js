const express = require('express');
const contactMessageController = require('../controllers/contactMessageController');
const { optionalAuth } = require('../middleware/optionalAuth');

const router = express.Router();

router.post('/', optionalAuth, contactMessageController.createContactMessage);

module.exports = router;
