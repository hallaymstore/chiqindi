const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { ensureAuth, ensureGuest } = require('../middlewares/auth');
const { uploadAvatar } = require('../middlewares/upload');
const { loginValidator, registerValidator } = require('../middlewares/validators');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring.'
});

router.get('/login', ensureGuest, authController.showLogin);
router.post('/login', authLimiter, ensureGuest, loginValidator, authController.login);
router.get('/register', ensureGuest, authController.showRegister);
router.post('/register', authLimiter, ensureGuest, registerValidator, authController.register);
router.post('/logout', ensureAuth, authController.logout);
router.get('/forgot-password', ensureGuest, authController.showForgotPassword);
router.post('/forgot-password', authLimiter, ensureGuest, authController.submitForgotPassword);
router.get('/profil', ensureAuth, authController.profile);
router.post('/profil', ensureAuth, uploadAvatar.single('avatar'), authController.updateProfile);
router.get('/bildirishnomalar', ensureAuth, authController.notifications);
router.post('/bildirishnomalar/:id/read', ensureAuth, authController.markNotificationRead);

module.exports = router;
