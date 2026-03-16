const Notification = require('../models/Notification');
const SiteSetting = require('../models/SiteSetting');
const { DASHBOARD_ROUTES } = require('../utils/constants');
const { publicNavigation, dashboardNavigation } = require('../utils/navigation');
const helpers = require('../utils/viewHelpers');

const defaultSiteSettings = {
  siteName: 'ChiqindiBor',
  tagline: 'Plastik chiqindini daromadga aylantiring',
  description: 'Plastik chiqindilarni topshirish, pickup buyurtma qilish va qayta ishlash zavodlari bilan ishlash uchun raqamli platforma.',
  supportEmail: 'support@chiqindibor.uz',
  supportPhone: '+998 90 000 00 00',
  address: 'Toshkent shahri, Chilonzor',
  heroTitle: 'Chiqindi endi muammo emas, iqtisodiy resurs',
  heroSubtitle: 'Plastik chiqindilarni tez, shaffof va foydali tarzda topshiring.',
  commissionRate: 8,
  seoDefaults: {
    title: 'ChiqindiBor',
    description: 'Plastik chiqindilarni yig‘ish, sotish va qayta ishlash uchun premium platforma.'
  },
  faqItems: []
};

const attachLocals = async (req, res, next) => {
  try {
    const [siteSettings, unreadNotificationsCount] = await Promise.all([
      SiteSetting.findOne().lean(),
      req.user ? Notification.countDocuments({ $or: [{ user: req.user._id }, { role: req.user.role }], isRead: false }) : 0
    ]);

    res.locals.siteSettings = siteSettings || defaultSiteSettings;
    res.locals.currentUser = req.user || null;
    res.locals.currentPath = req.originalUrl;
    res.locals.publicNavigation = publicNavigation;
    res.locals.dashboardNavigation = req.user ? dashboardNavigation[req.user.role] || [] : [];
    res.locals.dashboardHomeUrl = req.user ? DASHBOARD_ROUTES[req.user.role] || '/' : '/';
    res.locals.unreadNotificationsCount = unreadNotificationsCount;
    res.locals.helpers = helpers;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  attachLocals
};
