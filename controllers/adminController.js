const slugify = require('slugify');
const User = require('../models/User');
const Role = require('../models/Role');
const WasteCategory = require('../models/WasteCategory');
const PickupRequest = require('../models/PickupRequest');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');
const CollectionPoint = require('../models/CollectionPoint');
const Factory = require('../models/Factory');
const BlogPost = require('../models/BlogPost');
const Notification = require('../models/Notification');
const ContactMessage = require('../models/ContactMessage');
const SiteSetting = require('../models/SiteSetting');
const { ROLES } = require('../utils/constants');
const { rowsToCsv } = require('../utils/csv');
const { getGlobalAnalytics, getAdminTables } = require('../services/analyticsService');
const { notifyRole, notifyUser } = require('../services/notificationService');
const { createAuditLog } = require('../services/auditService');

const renderDashboard = (res, view, payload = {}) =>
  res.render(view, {
    layout: 'layouts/dashboard',
    ...payload
  });

const dashboard = async (req, res, next) => {
  try {
    const [analytics, tables] = await Promise.all([getGlobalAnalytics(), getAdminTables()]);
    renderDashboard(res, 'admin/dashboard', {
      pageTitle: 'Admin boshqaruv paneli',
      pageDescription: "Platforma holati, operatsiyalar va KPI ko'rsatkichlari.",
      analytics,
      recentPickups: tables.pickups.slice(0, 8),
      recentUsers: tables.users.slice(0, 6)
    });
  } catch (error) {
    next(error);
  }
};

const users = async (req, res, next) => {
  try {
    const q = req.query.q?.trim()?.toLowerCase() || '';
    const role = req.query.role || '';
    let items = await User.find().sort({ createdAt: -1 }).lean();

    if (q) {
      items = items.filter((item) => [item.name, item.email, item.phone, item.companyName].some((value) => value?.toLowerCase().includes(q)));
    }
    if (role) {
      items = items.filter((item) => item.role === role);
    }

    renderDashboard(res, 'admin/users', {
      pageTitle: 'Foydalanuvchilar boshqaruvi',
      pageDescription: "Rol, holat va aloqa ma'lumotlari bo'yicha foydalanuvchilar ro'yxati.",
      items,
      q,
      role,
      roles: Object.values(ROLES)
    });
  } catch (error) {
    next(error);
  }
};

const roles = async (req, res, next) => {
  try {
    const items = await Role.find().sort({ createdAt: 1 }).lean();
    renderDashboard(res, 'admin/roles', {
      pageTitle: 'Rollar',
      pageDescription: 'Tizimdagi rollar va ularning tavsifi.',
      items
    });
  } catch (error) {
    next(error);
  }
};

const categories = async (req, res, next) => {
  try {
    const items = await WasteCategory.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    renderDashboard(res, 'admin/categories', {
      pageTitle: 'Chiqindi turlari',
      pageDescription: 'Narxlar, icon va faollik holatini boshqaring.',
      items
    });
  } catch (error) {
    next(error);
  }
};

const saveCategory = async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      slug: slugify(req.body.name, { lower: true, strict: true }),
      pricePerKg: Number(req.body.pricePerKg || 0),
      description: req.body.description,
      icon: req.body.icon || 'ri-recycle-line',
      isActive: req.body.isActive === 'on',
      sortOrder: Number(req.body.sortOrder || 0),
      palette: req.body.palette || 'from-emerald'
    };

    if (req.body.categoryId) {
      await WasteCategory.findByIdAndUpdate(req.body.categoryId, payload, { runValidators: true });
    } else {
      await WasteCategory.create(payload);
    }

    await createAuditLog({
      actor: req.user,
      action: 'category_saved',
      entityType: 'WasteCategory',
      entityId: req.body.categoryId,
      description: 'Admin chiqindi toifasini saqladi.'
    });

    req.flash('success', 'Toifa muvaffaqiyatli saqlandi.');
    return res.redirect('/admin/categories');
  } catch (error) {
    return next(error);
  }
};

const pickups = async (req, res, next) => {
  try {
    const [items, collectors, points, factories] = await Promise.all([
      PickupRequest.find().populate('user category assignedCollector collectionPoint factory').sort({ createdAt: -1 }).lean(),
      User.find({ role: ROLES.COLLECTOR }).lean(),
      CollectionPoint.find({ status: 'active' }).lean(),
      Factory.find({ status: 'active' }).lean()
    ]);

    renderDashboard(res, 'admin/pickups', {
      pageTitle: "Pickup so'rovlari",
      pageDescription: 'Tasdiqlash, biriktirish va status oqimini boshqaring.',
      items,
      collectors,
      points,
      factories
    });
  } catch (error) {
    next(error);
  }
};

const updatePickupStatus = async (req, res, next) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) {
      req.flash('danger', 'Pickup topilmadi.');
      return res.redirect('/admin/pickups');
    }

    pickup.status = req.body.status;
    if (req.body.assignedCollector) {
      pickup.assignedCollector = req.body.assignedCollector;
    }
    if (req.body.collectionPoint) {
      pickup.collectionPoint = req.body.collectionPoint;
    }
    if (req.body.factory) {
      pickup.factory = req.body.factory;
    }
    pickup.timeline.push({
      status: req.body.status,
      note: req.body.note || 'Admin tomonidan yangilandi.',
      changedBy: req.user._id,
      changedAt: new Date()
    });
    await pickup.save();

    await Promise.all([
      notifyUser({
        user: pickup.user,
        title: "So'rov holati yangilandi",
        message: `Pickup so'rovingiz yangi holatga o'tdi: ${req.body.status}`,
        type: 'info',
        link: '/user/pickups'
      }),
      createAuditLog({
        actor: req.user,
        action: 'admin_pickup_update',
        entityType: 'PickupRequest',
        entityId: pickup._id,
        description: 'Admin pickup holatini yangiladi.',
        metadata: {
          status: req.body.status,
          collector: req.body.assignedCollector,
          point: req.body.collectionPoint,
          factory: req.body.factory
        }
      })
    ]);

    req.flash('success', "Pickup ma'lumotlari yangilandi.");
    return res.redirect('/admin/pickups');
  } catch (error) {
    return next(error);
  }
};

const transactions = async (req, res, next) => {
  try {
    const items = await Transaction.find().populate('sourceUser sourcePoint destinationFactory pickupRequest').sort({ createdAt: -1 }).lean();
    renderDashboard(res, 'admin/transactions', {
      pageTitle: 'Tranzaksiyalar',
      pageDescription: 'Platformadagi barcha iqtisodiy oqimlar va transfer yozuvlari.',
      items
    });
  } catch (error) {
    next(error);
  }
};

const payments = async (req, res, next) => {
  try {
    const items = await Payment.find().populate('user pickupRequest').sort({ createdAt: -1 }).lean();
    renderDashboard(res, 'admin/payments', {
      pageTitle: "To'lov yozuvlari",
      pageDescription: 'Baholangan va yakuniy payout yozuvlari.',
      items
    });
  } catch (error) {
    next(error);
  }
};

const exportPaymentsCsv = async (req, res, next) => {
  try {
    const items = await Payment.find().populate('user pickupRequest').sort({ createdAt: -1 }).lean();
    const rows = [
      ['Sana', 'Foydalanuvchi', 'Pickup ID', 'Baholangan summa', 'Yakuniy summa', 'Status', 'Usul']
    ];

    items.forEach((item) => {
      rows.push([
        item.createdAt,
        item.user?.name || '',
        item.pickupRequest?._id || '',
        item.estimatedAmount || 0,
        item.finalAmount || 0,
        item.paymentStatus || '',
        item.paymentMethod || ''
      ]);
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payments-report.csv"');
    res.send(rowsToCsv(rows));
  } catch (error) {
    next(error);
  }
};

const collectionPoints = async (req, res, next) => {
  try {
    const [items, managers, categoriesList] = await Promise.all([
      CollectionPoint.find().populate('manager acceptedCategories').sort({ createdAt: -1 }).lean(),
      User.find({ role: ROLES.POINT_MANAGER }).lean(),
      WasteCategory.find({ isActive: true }).lean()
    ]);

    renderDashboard(res, 'admin/collection-points', {
      pageTitle: 'Qabul punktlari',
      pageDescription: "Manzil, sig'im va qabul qilinadigan toifalar boshqaruvi.",
      items,
      managers,
      categoriesList
    });
  } catch (error) {
    next(error);
  }
};

const saveCollectionPoint = async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      slug: slugify(req.body.name, { lower: true, strict: true }),
      manager: req.body.manager || null,
      address: req.body.address,
      region: req.body.region,
      phone: req.body.phone,
      email: req.body.email,
      capacityKg: Number(req.body.capacityKg || 0),
      storedKg: Number(req.body.storedKg || 0),
      acceptedCategories: Array.isArray(req.body.acceptedCategories)
        ? req.body.acceptedCategories
        : req.body.acceptedCategories
        ? [req.body.acceptedCategories]
        : [],
      hours: req.body.hours,
      description: req.body.description,
      features: req.body.features ? req.body.features.split(',').map((item) => item.trim()).filter(Boolean) : [],
      status: req.body.status || 'active',
      location: {
        type: 'Point',
        coordinates: [Number(req.body.longitude || 69.2401), Number(req.body.latitude || 41.2995)]
      }
    };

    if (req.body.pointId) {
      await CollectionPoint.findByIdAndUpdate(req.body.pointId, payload, { runValidators: true });
    } else {
      await CollectionPoint.create(payload);
    }

    req.flash('success', "Punkt ma'lumotlari saqlandi.");
    return res.redirect('/admin/collection-points');
  } catch (error) {
    return next(error);
  }
};

const factories = async (req, res, next) => {
  try {
    const [items, managers, categoriesList] = await Promise.all([
      Factory.find().populate('manager acceptedCategories purchasePrices.category').sort({ createdAt: -1 }).lean(),
      User.find({ role: ROLES.FACTORY_MANAGER }).lean(),
      WasteCategory.find({ isActive: true }).lean()
    ]);

    renderDashboard(res, 'admin/factories', {
      pageTitle: 'Hamkor zavodlar',
      pageDescription: 'Zavodlar, qabul quvvatlari va xarid sozlamalari.',
      items,
      managers,
      categoriesList
    });
  } catch (error) {
    next(error);
  }
};

const saveFactory = async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      slug: slugify(req.body.name, { lower: true, strict: true }),
      manager: req.body.manager || null,
      address: req.body.address,
      region: req.body.region,
      phone: req.body.phone,
      email: req.body.email,
      website: req.body.website,
      acceptedCategories: Array.isArray(req.body.acceptedCategories)
        ? req.body.acceptedCategories
        : req.body.acceptedCategories
        ? [req.body.acceptedCategories]
        : [],
      dailyCapacityKg: Number(req.body.dailyCapacityKg || 0),
      processedKg: Number(req.body.processedKg || 0),
      description: req.body.description,
      status: req.body.status || 'active',
      location: {
        type: 'Point',
        coordinates: [Number(req.body.longitude || 69.2401), Number(req.body.latitude || 41.2995)]
      }
    };

    if (req.body.factoryId) {
      await Factory.findByIdAndUpdate(req.body.factoryId, payload, { runValidators: true });
    } else {
      await Factory.create(payload);
    }

    req.flash('success', "Zavod ma'lumotlari saqlandi.");
    return res.redirect('/admin/factories');
  } catch (error) {
    return next(error);
  }
};

const content = async (req, res, next) => {
  try {
    const settings = await SiteSetting.findOne().lean();
    renderDashboard(res, 'admin/content', {
      pageTitle: 'Kontent boshqaruvi',
      pageDescription: 'Hero matnlari, tagline va asosiy public kontent sozlamalari.',
      settings
    });
  } catch (error) {
    next(error);
  }
};

const blog = async (req, res, next) => {
  try {
    const items = await BlogPost.find().populate('author').sort({ createdAt: -1 }).lean();
    renderDashboard(res, 'admin/blog', {
      pageTitle: 'Blog boshqaruvi',
      pageDescription: 'Maqolalar, asosiy rasm va SEO maydonlari.',
      items
    });
  } catch (error) {
    next(error);
  }
};

const saveBlogPost = async (req, res, next) => {
  try {
    const payload = {
      title: req.body.title,
      slug: slugify(req.body.title, { lower: true, strict: true }),
      excerpt: req.body.excerpt,
      content: req.body.content,
      status: req.body.status || 'published',
      author: req.user._id,
      categories: req.body.categories ? req.body.categories.split(',').map((item) => item.trim()).filter(Boolean) : [],
      tags: req.body.tags ? req.body.tags.split(',').map((item) => item.trim()).filter(Boolean) : [],
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      publishedAt: req.body.status === 'published' ? new Date() : null,
      featured: req.body.featured === 'on'
    };

    if (req.file) {
      payload.featuredImage = `/uploads/blog/${req.file.filename}`;
    }

    if (req.body.postId) {
      await BlogPost.findByIdAndUpdate(req.body.postId, payload, { runValidators: true });
    } else {
      await BlogPost.create(payload);
    }

    req.flash('success', 'Maqola saqlandi.');
    return res.redirect('/admin/blog');
  } catch (error) {
    return next(error);
  }
};

const notifications = async (req, res, next) => {
  try {
    const items = await Notification.find().sort({ createdAt: -1 }).limit(50).lean();
    renderDashboard(res, 'admin/notifications', {
      pageTitle: 'Bildirishnomalar',
      pageDescription: "Rol bo'yicha announcement va individual xabarlar.",
      items,
      roles: Object.values(ROLES)
    });
  } catch (error) {
    next(error);
  }
};

const sendAnnouncement = async (req, res, next) => {
  try {
    if (req.body.targetRole === 'all') {
      await Promise.all(
        [ROLES.USER, ROLES.COLLECTOR, ROLES.POINT_MANAGER, ROLES.FACTORY_MANAGER, ROLES.ADMIN].map((role) =>
          notifyRole({
            role,
            title: req.body.title,
            message: req.body.message,
            type: 'announcement',
            link: req.body.link || ''
          })
        )
      );
    } else {
      await notifyRole({
        role: req.body.targetRole,
        title: req.body.title,
        message: req.body.message,
        type: 'announcement',
        link: req.body.link || ''
      });
    }

    req.flash('success', 'Announcement yuborildi.');
    return res.redirect('/admin/notifications');
  } catch (error) {
    return next(error);
  }
};

const reports = async (req, res, next) => {
  try {
    const analytics = await getGlobalAnalytics();
    renderDashboard(res, 'admin/reports', {
      pageTitle: 'Hisobotlar va analitika',
      pageDescription: "Kategoriya, status, o'sish va hududlar bo'yicha analitika.",
      analytics
    });
  } catch (error) {
    next(error);
  }
};

const settings = async (req, res, next) => {
  try {
    const settingsData = await SiteSetting.findOne().lean();
    renderDashboard(res, 'admin/settings', {
      pageTitle: 'Platforma sozlamalari',
      pageDescription: "Support ma'lumotlari, SEO va branding sozlamalari.",
      settings: settingsData
    });
  } catch (error) {
    next(error);
  }
};

const saveSettings = async (req, res, next) => {
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
        wastePricingMode: req.body.wastePricingMode,
        seoDefaults: {
          title: req.body.seoTitle,
          description: req.body.seoDescription
        },
        socialLinks: {
          telegram: req.body.telegram,
          instagram: req.body.instagram,
          linkedin: req.body.linkedin
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    req.flash('success', 'Sozlamalar yangilandi.');
    return res.redirect(req.body.redirectTo || '/admin/settings');
  } catch (error) {
    return next(error);
  }
};

const contacts = async (req, res, next) => {
  try {
    const items = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    renderDashboard(res, 'admin/contacts', {
      pageTitle: 'Murojaatlar',
      pageDescription: "Aloqa sahifasidan kelgan xabarlar va support so'rovlari.",
      items
    });
  } catch (error) {
    next(error);
  }
};

const faq = async (req, res, next) => {
  try {
    const settingsData = await SiteSetting.findOne().lean();
    renderDashboard(res, 'admin/faq', {
      pageTitle: 'FAQ boshqaruvi',
      pageDescription: 'Public savol-javob blokini yangilang.',
      faqs: settingsData?.faqItems || []
    });
  } catch (error) {
    next(error);
  }
};

const addFaqItem = async (req, res, next) => {
  try {
    await SiteSetting.findOneAndUpdate(
      {},
      { $push: { faqItems: { question: req.body.question, answer: req.body.answer } } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    req.flash('success', "FAQ elementi qo'shildi.");
    return res.redirect('/admin/faq');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  dashboard,
  users,
  roles,
  categories,
  saveCategory,
  pickups,
  updatePickupStatus,
  transactions,
  payments,
  exportPaymentsCsv,
  collectionPoints,
  saveCollectionPoint,
  factories,
  saveFactory,
  content,
  blog,
  saveBlogPost,
  notifications,
  sendAnnouncement,
  reports,
  settings,
  saveSettings,
  contacts,
  faq,
  addFaqItem
};


