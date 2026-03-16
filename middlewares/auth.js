const User = require('../models/User');
const { DASHBOARD_ROUTES } = require('../utils/constants');

const attachCurrentUser = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId).lean();
      if (!user) {
        req.session.userId = null;
      } else {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

const ensureAuth = (req, res, next) => {
  if (!req.user) {
    req.flash('warning', 'Davom etish uchun tizimga kiring.');
    return res.redirect('/login');
  }
  return next();
};

const ensureGuest = (req, res, next) => {
  if (req.user) {
    return res.redirect(DASHBOARD_ROUTES[req.user.role] || '/');
  }
  return next();
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    req.flash('warning', 'Davom etish uchun tizimga kiring.');
    return res.redirect('/login');
  }

  if (!allowedRoles.includes(req.user.role)) {
    req.flash('danger', 'Sizda ushbu bo‘limga kirish ruxsati yo‘q.');
    return res.redirect(DASHBOARD_ROUTES[req.user.role] || '/');
  }

  return next();
};

module.exports = {
  attachCurrentUser,
  ensureAuth,
  ensureGuest,
  authorize
};
