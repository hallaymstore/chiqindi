const express = require('express');
const adminController = require('../controllers/adminController');
const { ensureAuth, authorize } = require('../middlewares/auth');
const { uploadBlogImage } = require('../middlewares/upload');
const { categoryValidator, blogPostValidator } = require('../middlewares/validators');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(ensureAuth, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));
router.get('/dashboard', adminController.dashboard);
router.get('/users', adminController.users);
router.get('/roles', adminController.roles);
router.get('/categories', adminController.categories);
router.post('/categories', categoryValidator, adminController.saveCategory);
router.get('/pickups', adminController.pickups);
router.post('/pickups/:id/status', adminController.updatePickupStatus);
router.get('/transactions', adminController.transactions);
router.get('/payments', adminController.payments);
router.get('/payments/export.csv', adminController.exportPaymentsCsv);
router.get('/collection-points', adminController.collectionPoints);
router.post('/collection-points', adminController.saveCollectionPoint);
router.get('/factories', adminController.factories);
router.post('/factories', adminController.saveFactory);
router.get('/content', adminController.content);
router.get('/blog', adminController.blog);
router.post('/blog', uploadBlogImage.single('featuredImage'), blogPostValidator, adminController.saveBlogPost);
router.get('/notifications', adminController.notifications);
router.post('/notifications/announcement', adminController.sendAnnouncement);
router.get('/reports', adminController.reports);
router.get('/settings', adminController.settings);
router.post('/settings', adminController.saveSettings);
router.get('/contacts', adminController.contacts);
router.get('/faq', adminController.faq);
router.post('/faq', adminController.addFaqItem);

module.exports = router;
