const express = require('express');
const superAdminController = require('../controllers/superAdminController');
const { ensureAuth, authorize } = require('../middlewares/auth');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(ensureAuth, authorize(ROLES.SUPER_ADMIN));
router.get('/dashboard', superAdminController.dashboard);
router.get('/admins', superAdminController.admins);
router.post('/admins', superAdminController.createAdmin);
router.get('/system-settings', superAdminController.systemSettings);
router.post('/system-settings', superAdminController.updateSystemSettings);
router.get('/commissions', superAdminController.commissions);
router.post('/commissions', superAdminController.updateCommission);
router.get('/audit-logs', superAdminController.auditLogs);
router.get('/permissions', superAdminController.permissions);
router.post('/permissions/:roleId', superAdminController.updatePermissions);
router.get('/analytics', superAdminController.analytics);
router.get('/analytics/export.csv', superAdminController.exportAnalytics);

module.exports = router;
