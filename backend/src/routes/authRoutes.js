const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/profile', requireAuth, authController.updateProfile);
router.post('/upgrade-premium', requireAuth, authController.upgradeToPremium);
router.post('/cancel-premium', requireAuth, authController.cancelPremium);
router.patch('/premium', requireAuth, authController.upgradeToPremium);
router.patch('/delete-account', requireAuth, authController.deleteAccount);

module.exports = router;
