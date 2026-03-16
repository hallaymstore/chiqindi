const User = require('../models/User');
const Notification = require('../models/Notification');
const { DASHBOARD_ROUTES, ROLES } = require('../utils/constants');

const renderAuth = (res, view, payload = {}) =>
  res.render(view, {
    layout: 'layouts/main',
    ...payload
  });

const showLogin = (req, res) => {
  renderAuth(res, 'auth/login', {
    pageTitle: 'Kirish',
    pageDescription: 'ChiqindiBor tizimiga kirish.'
  });
};

const showRegister = (req, res) => {
  renderAuth(res, 'auth/register', {
    pageTitle: "Ro'yxatdan o'tish",
    pageDescription: 'Plastik chiqindilarni topshirish uchun hisob yarating.'
  });
};

const register = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existingUser) {
      req.flash('warning', 'Bu email bilan foydalanuvchi allaqachon mavjud.');
      return res.redirect('/register');
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      phone: req.body.phone,
      password: req.body.password,
      role: ROLES.USER,
      companyName: req.body.companyName,
      region: req.body.region,
      address: req.body.address
    });

    req.session.userId = user._id;
    req.flash('success', 'Hisob muvaffaqiyatli yaratildi. Xush kelibsiz!');
    return res.redirect(DASHBOARD_ROUTES[user.role] || '/');
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      req.flash('danger', "Email yoki parol noto'g'ri.");
      return res.redirect('/login');
    }

    const passwordMatches = await user.comparePassword(req.body.password);
    if (!passwordMatches) {
      req.flash('danger', "Email yoki parol noto'g'ri.");
      return res.redirect('/login');
    }

    if (!user.isActive) {
      req.flash('warning', 'Hisobingiz vaqtincha bloklangan.');
      return res.redirect('/login');
    }

    user.lastLoginAt = new Date();
    await user.save();

    req.session.userId = user._id;
    req.flash('success', 'Tizimga muvaffaqiyatli kirdingiz.');
    return res.redirect(DASHBOARD_ROUTES[user.role] || '/');
  } catch (error) {
    return next(error);
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

const showForgotPassword = (req, res) => {
  renderAuth(res, 'auth/forgot-password', {
    pageTitle: 'Parolni tiklash',
    pageDescription: "Parolni tiklash bo'yicha so'rov qoldiring."
  });
};

const submitForgotPassword = (req, res) => {
  req.flash('info', "So'rovingiz qabul qilindi. Siz bilan bog'lanib parolni tiklash bo'yicha yordam ko'rsatiladi.");
  res.redirect('/forgot-password');
};

const profile = (req, res) => {
  renderAuth(res, 'auth/profile', {
    layout: 'layouts/dashboard',
    pageTitle: 'Profil',
    pageDescription: "Shaxsiy ma'lumotlaringizni boshqaring."
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const updateData = {
      name: req.body.name,
      phone: req.body.phone,
      companyName: req.body.companyName,
      region: req.body.region,
      address: req.body.address,
      email: req.body.email?.toLowerCase()
    };

    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await User.findByIdAndUpdate(req.user._id, updateData, { runValidators: true });
    req.flash('success', "Profil ma'lumotlari yangilandi.");
    res.redirect('/profil');
  } catch (error) {
    next(error);
  }
};

const notifications = async (req, res, next) => {
  try {
    const notificationsList = await Notification.find({
      $or: [{ user: req.user._id }, { role: req.user.role }]
    })
      .sort({ createdAt: -1 })
      .lean();

    renderAuth(res, 'auth/notifications', {
      layout: 'layouts/dashboard',
      pageTitle: 'Bildirishnomalar',
      pageDescription: 'Sizga tegishli yangilanishlar va tizim xabarlari.',
      notificationsList
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ user: req.user._id }, { role: req.user.role }]
      },
      { isRead: true }
    );

    res.redirect('/bildirishnomalar');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  showLogin,
  showRegister,
  register,
  login,
  logout,
  showForgotPassword,
  submitForgotPassword,
  profile,
  updateProfile,
  notifications,
  markNotificationRead
};