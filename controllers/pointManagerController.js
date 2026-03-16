const CollectionPoint = require('../models/CollectionPoint');
const Factory = require('../models/Factory');
const PickupRequest = require('../models/PickupRequest');
const Transaction = require('../models/Transaction');
const { getPointMetrics } = require('../services/analyticsService');
const { notifyUser } = require('../services/notificationService');
const { createAuditLog } = require('../services/auditService');

const renderDashboard = (res, view, payload = {}) =>
  res.render(view, {
    layout: 'layouts/dashboard',
    ...payload
  });

const dashboard = async (req, res, next) => {
  try {
    const metrics = await getPointMetrics(req.user._id);
    renderDashboard(res, 'point-manager/dashboard', {
      pageTitle: 'Punkt menejeri boshqaruv paneli',
      pageDescription: "Qabul qilingan plastmassa, sig'im va kirimlar monitoringi.",
      metrics,
      incomingPickups: metrics.pickups.filter((item) => ['collected', 'delivered_to_point'].includes(item.status)).slice(0, 10)
    });
  } catch (error) {
    next(error);
  }
};

const inventory = async (req, res, next) => {
  try {
    const metrics = await getPointMetrics(req.user._id);
    renderDashboard(res, 'point-manager/inventory', {
      pageTitle: 'Inventar',
      pageDescription: 'Punktdagi joriy qoldiq va qabul qilinadigan toifalar.',
      metrics,
      items: metrics.pickups
    });
  } catch (error) {
    next(error);
  }
};

const transfers = async (req, res, next) => {
  try {
    const metrics = await getPointMetrics(req.user._id);
    const factories = await Factory.find({ status: 'active' }).populate('acceptedCategories').lean();
    renderDashboard(res, 'point-manager/transfers', {
      pageTitle: "Zavodga o'tkazish",
      pageDescription: "To'plangan plastikni zavodga yuborish jarayoni.",
      metrics,
      factories,
      transferable: metrics.pickups.filter((item) => item.status === 'delivered_to_point')
    });
  } catch (error) {
    next(error);
  }
};

const reviewPickup = async (req, res, next) => {
  try {
    const point = await CollectionPoint.findOne({ manager: req.user._id });
    const pickup = await PickupRequest.findById(req.params.id);

    if (!point || !pickup) {
      req.flash('danger', 'Pickup yoki punkt topilmadi.');
      return res.redirect('/point-manager/dashboard');
    }

    if (req.body.decision === 'reject') {
      pickup.status = 'rejected';
    } else {
      const actualWeight = Number(req.body.actualWeight || pickup.actualWeight || pickup.estimatedWeight);
      pickup.actualWeight = actualWeight;
      pickup.finalAmount = actualWeight * Number(pickup.offeredRate || 0);
      pickup.collectionPoint = point._id;
      pickup.status = 'delivered_to_point';
      pickup.timeline.push({
        status: 'delivered_to_point',
        note: 'Punkt menejeri chiqindini qabul qildi.',
        changedBy: req.user._id,
        changedAt: new Date()
      });
      point.storedKg += actualWeight;
      await point.save();
    }

    await pickup.save();

    await Promise.all([
      notifyUser({
        user: pickup.user,
        title: 'Punkt holati yangilandi',
        message: req.body.decision === 'reject' ? 'Chiqindi punkt tomonidan rad etildi.' : 'Chiqindi punkt tomonidan qabul qilindi.',
        type: req.body.decision === 'reject' ? 'warning' : 'success',
        link: '/user/pickups'
      }),
      createAuditLog({
        actor: req.user,
        action: 'point_review',
        entityType: 'PickupRequest',
        entityId: pickup._id,
        description: "Punkt menejeri pickupni ko'rib chiqdi.",
        metadata: { decision: req.body.decision }
      })
    ]);

    req.flash('success', "Pickup bo'yicha qaror saqlandi.");
    return res.redirect('/point-manager/dashboard');
  } catch (error) {
    return next(error);
  }
};

const createTransfer = async (req, res, next) => {
  try {
    const point = await CollectionPoint.findOne({ manager: req.user._id });
    const pickup = await PickupRequest.findById(req.body.pickupId);
    const factory = await Factory.findById(req.body.factoryId);

    if (!point || !pickup || !factory) {
      req.flash('danger', "Transfer uchun kerakli ma'lumot topilmadi.");
      return res.redirect('/point-manager/transfers');
    }

    pickup.factory = factory._id;
    pickup.status = 'delivered_to_factory';
    pickup.timeline.push({
      status: 'delivered_to_factory',
      note: 'Punktdan zavodga yuborildi.',
      changedBy: req.user._id,
      changedAt: new Date()
    });
    await pickup.save();

    point.storedKg = Math.max(0, Number(point.storedKg || 0) - Number(pickup.actualWeight || 0));
    await point.save();

    await Transaction.create({
      type: 'point_transfer',
      sourcePoint: point._id,
      destinationFactory: factory._id,
      pickupRequest: pickup._id,
      amount: pickup.finalAmount,
      weight: pickup.actualWeight,
      transactionId: `PT-${Date.now()}`,
      createdBy: req.user._id,
      notes: "Punktdan zavodga jo'natildi."
    });

    await createAuditLog({
      actor: req.user,
      action: 'point_transfer_created',
      entityType: 'PickupRequest',
      entityId: pickup._id,
      description: 'Punkt menejeri zavodga transfer yaratdi.',
      metadata: { factoryId: factory._id }
    });

    req.flash('success', 'Transfer muvaffaqiyatli yaratildi.');
    return res.redirect('/point-manager/transfers');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  dashboard,
  inventory,
  transfers,
  reviewPickup,
  createTransfer
};


