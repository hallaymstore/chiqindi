const User = require('../models/User');
const WasteCategory = require('../models/WasteCategory');
const WasteListing = require('../models/WasteListing');
const PickupRequest = require('../models/PickupRequest');
const Payment = require('../models/Payment');
const CollectionPoint = require('../models/CollectionPoint');
const Notification = require('../models/Notification');
const { ROLES } = require('../utils/constants');
const { getUserMetrics } = require('../services/analyticsService');
const { notifyUser, notifyRole } = require('../services/notificationService');
const { createAuditLog } = require('../services/auditService');

const renderDashboard = (res, view, payload = {}) =>
  res.render(view, {
    layout: 'layouts/dashboard',
    ...payload
  });

const dashboard = async (req, res, next) => {
  try {
    const [metrics, categories, notificationsList] = await Promise.all([
      getUserMetrics(req.user._id),
      WasteCategory.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
      Notification.find({ $or: [{ user: req.user._id }, { role: req.user.role }] }).sort({ createdAt: -1 }).limit(5).lean()
    ]);

    renderDashboard(res, 'user/dashboard', {
      pageTitle: 'Shaxsiy kabinet',
      pageDescription: "Chiqindi topshiriqlari, olib ketish jarayoni va daromad ko'rsatkichlari.",
      metrics,
      categories,
      notificationsList,
      recentActivity: [...metrics.pickups, ...metrics.listings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6)
    });
  } catch (error) {
    next(error);
  }
};

const listings = async (req, res, next) => {
  try {
    const items = await WasteListing.find({ user: req.user._id }).populate('category').sort({ createdAt: -1 }).lean();
    renderDashboard(res, 'user/listings', {
      pageTitle: "E'lonlarim",
      pageDescription: "Yaratilgan topshiriqlar va ularning joriy holati.",
      items
    });
  } catch (error) {
    next(error);
  }
};

const newListing = async (req, res, next) => {
  try {
    const [categories, points] = await Promise.all([
      WasteCategory.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
      CollectionPoint.find({ status: 'active' }).lean()
    ]);

    renderDashboard(res, 'user/new-listing', {
      pageTitle: 'Yangi topshiruv',
      pageDescription: "Plastik chiqindi ma'lumotlarini kiriting va olib ketish so'rovini yuboring.",
      categories,
      points
    });
  } catch (error) {
    next(error);
  }
};

const createListing = async (req, res, next) => {
  try {
    const category = await WasteCategory.findById(req.body.category).lean();
    if (!category) {
      req.flash('danger', 'Chiqindi turi topilmadi.');
      return res.redirect('/user/listings/new');
    }

    const images = (req.files || []).map((file) => `/uploads/listings/${file.filename}`);
    const longitude = Number(req.body.longitude || 69.2401);
    const latitude = Number(req.body.latitude || 41.2995);
    const activePoint = await CollectionPoint.findOne({ status: 'active' }).lean();

    const listing = await WasteListing.create({
      user: req.user._id,
      category: category._id,
      title: req.body.title,
      description: req.body.description,
      images,
      estimatedWeight: Number(req.body.estimatedWeight),
      address: req.body.address,
      region: req.body.region,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      preferredPickupAt: req.body.preferredPickupAt || null,
      notes: req.body.notes,
      requestedPickup: req.body.requestedPickup !== 'off',
      offeredRate: category.pricePerKg,
      status: 'submitted'
    });

    const pickup = await PickupRequest.create({
      user: req.user._id,
      listing: listing._id,
      category: category._id,
      collectionPoint: activePoint?._id,
      status: 'pending',
      estimatedWeight: Number(req.body.estimatedWeight),
      address: req.body.address,
      region: req.body.region,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      preferredDate: req.body.preferredPickupAt || null,
      notes: req.body.notes,
      images,
      offeredRate: category.pricePerKg,
      estimatedAmount: Number(req.body.estimatedWeight) * Number(category.pricePerKg),
      timeline: [
        {
          status: 'pending',
          note: "So'rov foydalanuvchi tomonidan yaratildi.",
          changedBy: req.user._id,
          changedAt: new Date()
        }
      ]
    });

    await Promise.all([
      notifyUser({
        user: req.user._id,
        title: "Olib ketish so'rovi yaratildi",
        message: "So'rovingiz qabul qilindi va tez orada ko'rib chiqiladi.",
        type: 'success',
        link: '/user/pickups'
      }),
      notifyRole({
        role: ROLES.ADMIN,
        title: 'Yangi topshiruv',
        message: `${req.user.name} yangi plastik chiqindi topshirig'ini yubordi.`,
        type: 'announcement',
        link: '/admin/pickups'
      }),
      createAuditLog({
        actor: req.user,
        action: 'listing_created',
        entityType: 'WasteListing',
        entityId: listing._id,
        description: "Foydalanuvchi yangi chiqindi e'lonini yaratdi.",
        metadata: { pickupId: pickup._id }
      })
    ]);

    req.flash('success', "Chiqindi topshiruvi yaratildi va ko'rib chiqish uchun yuborildi.");
    return res.redirect('/user/pickups');
  } catch (error) {
    return next(error);
  }
};

const pickups = async (req, res, next) => {
  try {
    const items = await PickupRequest.find({ user: req.user._id })
      .populate('category assignedCollector collectionPoint factory')
      .sort({ createdAt: -1 })
      .lean();

    renderDashboard(res, 'user/pickups', {
      pageTitle: "Olib ketish so'rovlari",
      pageDescription: "So'rov holati va jarayon tarixini kuzating.",
      items
    });
  } catch (error) {
    next(error);
  }
};

const payments = async (req, res, next) => {
  try {
    const items = await Payment.find({ user: req.user._id }).populate('pickupRequest').sort({ createdAt: -1 }).lean();
    renderDashboard(res, 'user/payments', {
      pageTitle: "To'lovlar",
      pageDescription: "Yakuniy to'lovlar va tranzaksiya yozuvlari.",
      items
    });
  } catch (error) {
    next(error);
  }
};

const favorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favoriteCollectionPoints').lean();
    const points = await CollectionPoint.find({ status: 'active' }).lean();
    renderDashboard(res, 'user/favorites', {
      pageTitle: 'Sevimli punktlar',
      pageDescription: "Tezkor topshiruv uchun saqlangan punktlar ro'yxati.",
      favoritesList: user?.favoriteCollectionPoints || [],
      points
    });
  } catch (error) {
    next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { favoriteCollectionPoints: req.params.pointId } });
    req.flash('success', "Punkt sevimlilar ro'yxatiga qo'shildi.");
    res.redirect('/user/favorites');
  } catch (error) {
    next(error);
  }
};

const aiPage = async (req, res, next) => {
  try {
    const categories = await WasteCategory.find({ isActive: true }).lean();
    renderDashboard(res, 'user/ai', {
      pageTitle: "Surat bo'yicha tavsiya",
      pageDescription: "Rasmga qarab mos chiqindi turini tez tanlashga yordam beruvchi bo'lim.",
      categories,
      suggestion: null
    });
  } catch (error) {
    next(error);
  }
};

const aiAnalyze = async (req, res, next) => {
  try {
    const categories = await WasteCategory.find({ isActive: true }).lean();
    const fileName = req.file?.originalname?.toLowerCase() || '';

    let suggestion = categories[0] || null;
    if (fileName.includes('pet') || fileName.includes('bottle')) {
      suggestion = categories.find((item) => item.slug.includes('pet')) || suggestion;
    } else if (fileName.includes('paket') || fileName.includes('bag')) {
      suggestion = categories.find((item) => item.slug.includes('plastic-bags')) || suggestion;
    } else if (fileName.includes('container')) {
      suggestion = categories.find((item) => item.slug.includes('containers')) || suggestion;
    } else if (req.body.manualCategory) {
      suggestion = categories.find((item) => String(item._id) === req.body.manualCategory) || suggestion;
    }

    renderDashboard(res, 'user/ai', {
      pageTitle: "Surat bo'yicha tavsiya",
      pageDescription: "Rasmga qarab mos chiqindi turini tez tanlashga yordam beruvchi bo'lim.",
      categories,
      suggestion,
      uploadedImage: req.file ? `/uploads/listings/${req.file.filename}` : null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  dashboard,
  listings,
  newListing,
  createListing,
  pickups,
  payments,
  favorites,
  addFavorite,
  aiPage,
  aiAnalyze
};