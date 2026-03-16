const Factory = require('../models/Factory');
const PickupRequest = require('../models/PickupRequest');
const Transaction = require('../models/Transaction');
const WasteCategory = require('../models/WasteCategory');
const { getFactoryMetrics } = require('../services/analyticsService');
const { notifyUser } = require('../services/notificationService');
const { createAuditLog } = require('../services/auditService');

const renderDashboard = (res, view, payload = {}) =>
  res.render(view, {
    layout: 'layouts/dashboard',
    ...payload
  });

const dashboard = async (req, res, next) => {
  try {
    const [metrics, categories] = await Promise.all([getFactoryMetrics(req.user._id), WasteCategory.find({ isActive: true }).lean()]);
    renderDashboard(res, 'factory/dashboard', {
      pageTitle: 'Zavod boshqaruv paneli',
      pageDescription: "Kelib tushayotgan plastik, procurement va qayta ishlash ko'rsatkichlari.",
      metrics,
      categories
    });
  } catch (error) {
    next(error);
  }
};

const incoming = async (req, res, next) => {
  try {
    const metrics = await getFactoryMetrics(req.user._id);
    renderDashboard(res, 'factory/incoming', {
      pageTitle: 'Kelib tushayotganlar',
      pageDescription: 'Punkt va foydalanuvchilardan kelayotgan partiyalar.',
      items: metrics.pickups,
      factory: metrics.factory
    });
  } catch (error) {
    next(error);
  }
};

const suppliers = async (req, res, next) => {
  try {
    const metrics = await getFactoryMetrics(req.user._id);
    const grouped = Object.values(
      metrics.pickups.reduce((accumulator, pickup) => {
        const key = String(pickup.user?._id || pickup.user);
        if (!accumulator[key]) {
          accumulator[key] = {
            supplier: pickup.user,
            totalWeight: 0,
            totalAmount: 0,
            totalOrders: 0
          };
        }
        accumulator[key].totalWeight += pickup.actualWeight || 0;
        accumulator[key].totalAmount += pickup.finalAmount || 0;
        accumulator[key].totalOrders += 1;
        return accumulator;
      }, {})
    );

    renderDashboard(res, 'factory/suppliers', {
      pageTitle: "Ta'minotchilar",
      pageDescription: 'Asosiy yetkazib beruvchilar va xarid hajmi.',
      suppliersList: grouped,
      factory: metrics.factory
    });
  } catch (error) {
    next(error);
  }
};

const updatePrice = async (req, res, next) => {
  try {
    const factory = await Factory.findOne({ manager: req.user._id });
    if (!factory) {
      req.flash('danger', 'Zavod topilmadi.');
      return res.redirect('/factory/dashboard');
    }

    const categoryId = String(req.body.categoryId);
    const pricePerKg = Number(req.body.pricePerKg || 0);
    const existingItem = factory.purchasePrices.find((item) => String(item.category) === categoryId);

    if (existingItem) {
      existingItem.pricePerKg = pricePerKg;
    } else {
      factory.purchasePrices.push({ category: categoryId, pricePerKg });
    }

    await factory.save();
    req.flash('success', 'Xarid narxi yangilandi.');
    return res.redirect('/factory/dashboard');
  } catch (error) {
    return next(error);
  }
};

const reviewIncoming = async (req, res, next) => {
  try {
    const factory = await Factory.findOne({ manager: req.user._id });
    const pickup = await PickupRequest.findOne({ _id: req.params.id, factory: factory?._id });

    if (!factory || !pickup) {
      req.flash('danger', 'Partiya topilmadi.');
      return res.redirect('/factory/incoming');
    }

    if (req.body.decision === 'reject') {
      pickup.status = 'rejected';
    } else {
      pickup.status = 'completed';
      pickup.paymentStatus = 'paid';
      if (req.body.actualWeight) {
        pickup.actualWeight = Number(req.body.actualWeight);
        pickup.finalAmount = Number(pickup.actualWeight) * Number(pickup.offeredRate || 0);
      }

      await Transaction.create({
        type: 'factory_purchase',
        sourcePoint: pickup.collectionPoint,
        destinationFactory: factory._id,
        pickupRequest: pickup._id,
        amount: pickup.finalAmount,
        weight: pickup.actualWeight,
        transactionId: `FC-${Date.now()}`,
        createdBy: req.user._id,
        notes: 'Zavod tomonidan qabul qilindi.'
      });
    }

    pickup.timeline.push({
      status: pickup.status,
      note: req.body.note || "Zavod tomonidan ko'rib chiqildi.",
      changedBy: req.user._id,
      changedAt: new Date()
    });
    await pickup.save();

    await Promise.all([
      notifyUser({
        user: pickup.user,
        title: 'Zavod qarori',
        message: req.body.decision === 'reject' ? 'Partiya zavod tomonidan rad etildi.' : 'Partiya zavod tomonidan qabul qilindi.',
        type: req.body.decision === 'reject' ? 'warning' : 'success',
        link: '/user/pickups'
      }),
      createAuditLog({
        actor: req.user,
        action: 'factory_review',
        entityType: 'PickupRequest',
        entityId: pickup._id,
        description: "Zavod menejeri partiya bo'yicha qaror chiqardi.",
        metadata: { decision: req.body.decision }
      })
    ]);

    req.flash('success', 'Zavod qarori saqlandi.');
    return res.redirect('/factory/incoming');
  } catch (error) {
    return next(error);
  }
};

const processPickup = async (req, res, next) => {
  try {
    const factory = await Factory.findOne({ manager: req.user._id });
    if (!factory) {
      req.flash('danger', 'Zavod topilmadi.');
      return res.redirect('/factory/dashboard');
    }

    factory.processedKg += Number(req.body.processedKg || 0);
    await factory.save();

    await createAuditLog({
      actor: req.user,
      action: 'factory_processed_quantity',
      entityType: 'Factory',
      entityId: factory._id,
      description: 'Qayta ishlangan hajm yangilandi.',
      metadata: { processedKg: Number(req.body.processedKg || 0) }
    });

    req.flash('success', 'Qayta ishlangan miqdor yangilandi.');
    return res.redirect('/factory/dashboard');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  dashboard,
  incoming,
  suppliers,
  updatePrice,
  reviewIncoming,
  processPickup
};

