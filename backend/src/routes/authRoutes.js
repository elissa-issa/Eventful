const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/profile', requireAuth, authController.updateProfile);
router.patch('/premium', requireAuth, authController.upgradeToPremium);
router.patch('/delete-account', requireAuth, authController.deleteAccount);

module.exports = router;
