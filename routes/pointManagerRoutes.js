const express = require('express');
const pointManagerController = require('../controllers/pointManagerController');
const { ensureAuth, authorize } = require('../middlewares/auth');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(ensureAuth, authorize(ROLES.POINT_MANAGER));
router.get('/dashboard', pointManagerController.dashboard);
router.get('/inventory', pointManagerController.inventory);
router.get('/transfers', pointManagerController.transfers);
router.post('/pickups/:id/review', pointManagerController.reviewPickup);
router.post('/transfers', pointManagerController.createTransfer);

module.exports = router;
