const express = require('express');
const userController = require('../controllers/userController');
const { ensureAuth, authorize } = require('../middlewares/auth');
const { uploadListingImages } = require('../middlewares/upload');
const { listingValidator } = require('../middlewares/validators');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(ensureAuth, authorize(ROLES.USER));
router.get('/dashboard', userController.dashboard);
router.get('/listings', userController.listings);
router.get('/listings/new', userController.newListing);
router.post('/listings', uploadListingImages.array('images', 4), listingValidator, userController.createListing);
router.get('/pickups', userController.pickups);
router.get('/payments', userController.payments);
router.get('/favorites', userController.favorites);
router.post('/favorites/:pointId', userController.addFavorite);
router.get('/ai-aniqlash', userController.aiPage);
router.post('/ai-aniqlash', uploadListingImages.single('image'), userController.aiAnalyze);

module.exports = router;
