const express = require('express');
const factoryController = require('../controllers/factoryController');
const { ensureAuth, authorize } = require('../middlewares/auth');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(ensureAuth, authorize(ROLES.FACTORY_MANAGER));
router.get('/dashboard', factoryController.dashboard);
router.get('/incoming', factoryController.incoming);
router.get('/suppliers', factoryController.suppliers);
router.post('/price', factoryController.updatePrice);
router.post('/pickups/:id/decision', factoryController.reviewIncoming);
router.post('/process', factoryController.processPickup);

module.exports = router;
