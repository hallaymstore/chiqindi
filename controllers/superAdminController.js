const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const SiteSetting = require('../models/SiteSetting');
const WasteCategory = require('../models/WasteCategory');
const PickupRequest = require('../models/PickupRequest');
const { ROLES } = require('../utils/constants');
const { rowsToCsv } = require('../utils/csv');
const { getGlobalAnalytics } = require('../services/analyticsService');
const { createAuditLog } = require('../services/auditService');

const renderDashboard = (res, view, payload = {}) =>
  res.render(view, {
    layout: 'layouts/dashboard',
    ...payload
  });

const dashboard = async (req, res, next) => {
  try {
    const analytics = await getGlobalAnalytics();
    renderDashboard(res, 'super-admin/dashboard', {
      pageTitle: 'Super admin boshqaruv paneli',
      pageDescription: 'Tizim miqyosidagi KPI, audit va boshqaruv ko‘rsatkichlari.',
      analytics
    });
  } catch (error) {
    next(error);
  }
};

const admins = async (req, res, next) => {
  try {
    const items = await User.find({ role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } }).sort({ createdAt: -1 }).lean();
    renderDashboard(res, 'super-admin/admins', {
      pageTitle: 'Adminlar',
      pageDescription: 'Admin va super admin hisoblarini boshqaring.',
      items
    });
  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    await User.create({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      phone: req.body.phone,
      password: req.body.password,
      role: req.body.role || ROLES.ADMIN,
      companyName: req.body.companyName,
      region: req.body.region,
      address: req.body.address
    });

    await createAuditLog({
      actor: req.user,
      action: 'admin_created',
      entityType: 'User',
      description: 'Super admin yangi admin yaratdi.',
      metadata: { email: req.body.email, role: req.body.role || ROLES.ADMIN }
    });

    req.flash('success', 'Yangi admin yaratildi.');
    return res.redirect('/super-admin/admins');
  } catch (error) {
    return next(error);
  }
};

const systemSettings = async (req, res, next) => {
  try {
    const settings = await SiteSetting.findOne().lean();
    renderDashboard(res, 'super-admin/system-settings', {
      pageTitle: 'Tizim sozlamalari',
      pageDescription: 'Branding, support va SEO bo‘yicha tizim darajasidagi sozlamalar.',
      settings
    });
  } catch (error) {
    next(error);
  }
};

const updateSystemSettings = async (req, res, next) => {
  try {
    await SiteSetting.findOneAndUpdate(
      {},
      {
        siteName: req.body.siteName,
        tagline: req.body.tagline,
        description: req.body.description,
        supportEmail: req.body.supportEmail,
        supportPhone: req.body.supportPhone,
        address: req.body.address,
        heroTitle: req.body.heroTitle,
        heroSubtitle: req.body.heroSubtitle,
        seoDefaults: {
          title: req.body.seoTitle,
          description: req.body.seoDescription
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    req.flash('success', 'Tizim sozlamalari yangilandi.');
    return res.redirect('/super-admin/system-settings');
  } catch (error) {
    return next(error);
  }
};

const commissions = async (req, res, next) => {
  try {
    const [settings, categories] = await Promise.all([SiteSetting.findOne().lean(), WasteCategory.find().lean()]);
    renderDashboard(res, 'super-admin/commissions', {
      pageTitle: 'Komissiya va pricing logikasi',
      pageDescription: 'Platforma komissiyasi va chiqindi narx mantiqi.',
      settings,
      categories
    });
  } catch (error) {
    next(error);
  }
};

const updateCommission = async (req, res, next) => {
  try {
    await SiteSetting.findOneAndUpdate(
      {},
      {
        commissionRate: Number(req.body.commissionRate || 0),
        wastePricingMode: req.body.wastePricingMode || 'dynamic'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    req.flash('success', 'Komissiya sozlamalari yangilandi.');
    return res.redirect('/super-admin/commissions');
  } catch (error) {
    return next(error);
  }
};

const auditLogs = async (req, res, next) => {
  try {
    const items = await AuditLog.find().populate('actor').sort({ createdAt: -1 }).limit(200).lean();
    renderDashboard(res, 'super-admin/audit-logs', {
      pageTitle: 'Audit loglar',
      pageDescription: 'Tizimdagi muhim harakatlar tarixi.',
      items
    });
  } catch (error) {
    next(error);
  }
};

const permissions = async (req, res, next) => {
  try {
    const items = await Role.find().sort({ createdAt: 1 }).lean();
    renderDashboard(res, 'super-admin/permissions', {
      pageTitle: 'Ruxsatlar',
      pageDescription: 'Har bir rol uchun permission massivlarini boshqaring.',
      items
    });
  } catch (error) {
    next(error);
  }
};

const updatePermissions = async (req, res, next) => {
  try {
    const permissionsList = req.body.permissions
      ? req.body.permissions
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    await Role.findByIdAndUpdate(req.params.roleId, { permissions: permissionsList });

    await createAuditLog({
      actor: req.user,
      action: 'role_permissions_updated',
      entityType: 'Role',
      entityId: req.params.roleId,
      description: 'Super admin rol ruxsatlarini yangiladi.',
      metadata: { permissions: permissionsList }
    });

    req.flash('success', 'Rol ruxsatlari yangilandi.');
    return res.redirect('/super-admin/permissions');
  } catch (error) {
    return next(error);
  }
};

const analytics = async (req, res, next) => {
  try {
    const analyticsData = await getGlobalAnalytics();
    renderDashboard(res, 'super-admin/analytics', {
      pageTitle: 'To‘liq analitika',
      pageDescription: 'Tizim bo‘yicha barcha asosiy indikatorlar va eksport.',
      analytics: analyticsData
    });
  } catch (error) {
    next(error);
  }
};

const exportAnalytics = async (req, res, next) => {
  try {
    const pickups = await PickupRequest.find().populate('user category collectionPoint factory').sort({ createdAt: -1 }).lean();
    const rows = [['Sana', 'Foydalanuvchi', 'Kategoriya', 'Status', 'Vazn', 'Summa', 'Punkt', 'Zavod']];

    pickups.forEach((pickup) => {
      rows.push([
        pickup.createdAt,
        pickup.user?.name || '',
        pickup.category?.name || '',
        pickup.status,
        pickup.actualWeight || pickup.estimatedWeight || 0,
        pickup.finalAmount || pickup.estimatedAmount || 0,
        pickup.collectionPoint?.name || '',
        pickup.factory?.name || ''
      ]);
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.csv"');
    res.send(rowsToCsv(rows));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  dashboard,
  admins,
  createAdmin,
  systemSettings,
  updateSystemSettings,
  commissions,
  updateCommission,
  auditLogs,
  permissions,
  updatePermissions,
  analytics,
  exportAnalytics
};

