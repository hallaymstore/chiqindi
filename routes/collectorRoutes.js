const express = require('express');
const collectorController = require('../controllers/collectorController');
const { ensureAuth, authorize } = require('../middlewares/auth');
const { uploadProofImages } = require('../middlewares/upload');
const { pickupStatusValidator } = require('../middlewares/validators');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(ensureAuth, authorize(ROLES.COLLECTOR));
router.get('/dashboard', collectorController.dashboard);
router.get('/queue', collectorController.queue);
router.get('/history', collectorController.history);
router.post('/pickups/:id/status', uploadProofImages.array('proofPhotos', 3), pickupStatusValidator, collectorController.updateStatus);

module.exports = router;
