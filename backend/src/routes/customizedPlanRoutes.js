const express = require('express');
const customizedPlanController = require('../controllers/customizedPlanController');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/', customizedPlanController.listPlans);
router.post('/', customizedPlanController.createPlan);
router.get('/:planId', customizedPlanController.getPlan);
router.patch('/:planId', customizedPlanController.updatePlan);
router.delete('/:planId', customizedPlanController.deletePlan);
router.post('/:planId/items', customizedPlanController.addItem);
router.patch('/:planId/items/:itemId', customizedPlanController.updateItem);
router.delete('/:planId/items/:itemId', customizedPlanController.removeItem);

module.exports = router;
