const express = require('express');
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.post('/inspiration-plan', requireAuth, aiController.createInspirationPlan);

module.exports = router;
