const express = require('express');
const publicController = require('../controllers/publicController');
const { contactValidator } = require('../middlewares/validators');

const router = express.Router();

router.get('/', publicController.home);
router.get('/haqida', publicController.about);
router.get('/qanday-ishlaydi', publicController.howItWorks);
router.get('/punktlar', publicController.collectionPoints);
router.get('/hamkor-zavodlar', publicController.partners);
router.get('/narxlar', publicController.pricing);
router.get('/blog', publicController.blog);
router.get('/blog/:slug', publicController.blogDetail);
router.get('/faq', publicController.faq);
router.get('/aloqa', publicController.contact);
router.post('/aloqa', contactValidator, publicController.submitContact);

module.exports = router;
