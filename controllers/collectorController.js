const PickupRequest = require('../models/PickupRequest');
const WasteListing = require('../models/WasteListing');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { getCollectorMetrics } = require('../services/analyticsService');
const { notifyUser } = require('../services/notificationService');
const { createAuditLog } = require('../services/auditService');

const renderDashboard = (res, view, payload = {}) =>
  res.render(view, {
    layout: 'layouts/dashboard',
    ...payload
  });

const dashboard = async (req, res, next) => {
  try {
    const metrics = await getCollectorMetrics(req.user._id);
    renderDashboard(res, 'collector/dashboard', {
      pageTitle: 'Haydovchi boshqaruv paneli',
      pageDescription: 'Biriktirilgan pickup navbatlari va samaradorlik ko‘rsatkichlari.',
      metrics,
      activeQueue: metrics.pickups.filter((item) => !['completed', 'cancelled', 'rejected'].includes(item.status)).slice(0, 8)
    });
  } catch (error) {
    next(error);
  }
};

const queue = async (req, res, next) => {
  try {
    const metrics = await getCollectorMetrics(req.user._id);
    renderDashboard(res, 'collector/queue', {
      pageTitle: 'Kunlik navbat',
      pageDescription: 'Bugungi va aktiv pickup topshiriqlari.',
      items: metrics.pickups.filter((item) => !['completed', 'cancelled', 'rejected'].includes(item.status))
    });
  } catch (error) {
    next(error);
  }
};

const history = async (req, res, next) => {
  try {
    const metrics = await getCollectorMetrics(req.user._id);
    renderDashboard(res, 'collector/history', {
      pageTitle: 'Pickup tarixi',
      pageDescription: 'Yakunlangan va bekor qilingan topshiriqlar tarixi.',
      items: metrics.pickups.filter((item) => ['completed', 'cancelled', 'rejected'].includes(item.status))
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const pickup = await PickupRequest.findOne({ _id: req.params.id, assignedCollector: req.user._id });
    if (!pickup) {
      req.flash('danger', 'Pickup topilmadi yoki sizga biriktirilmagan.');
      return res.redirect('/collector/queue');
    }

    pickup.status = req.body.status;
    if (req.body.actualWeight) {
      pickup.actualWeight = Number(req.body.actualWeight);
      pickup.finalAmount = Number(req.body.actualWeight) * Number(pickup.offeredRate || 0);
    }
    if (req.body.note) {
      pickup.notes = `${pickup.notes || ''}\n${req.body.note}`.trim();
    }
    if (req.files?.length) {
      pickup.proofPhotos = [...(pickup.proofPhotos || []), ...req.files.map((file) => `/uploads/proofs/${file.filename}`)];
    }
    pickup.timeline.push({
      status: req.body.status,
      note: req.body.note || 'Status yangilandi',
      changedBy: req.user._id,
      changedAt: new Date()
    });
    await pickup.save();

    await WasteListing.findByIdAndUpdate(pickup.listing, {
      status: req.body.status === 'completed' ? 'completed' : req.body.status === 'collected' ? 'approved' : 'submitted'
    });

    if (req.body.status === 'completed') {
      const transaction = await Transaction.create({
        type: 'user_sale',
        sourceUser: pickup.user,
        pickupRequest: pickup._id,
        listing: pickup.listing,
        amount: pickup.finalAmount,
        weight: pickup.actualWeight,
        transactionId: `TRX-${Date.now()}`,
        createdBy: req.user._id,
        notes: 'Pickup haydovchi tomonidan yakunlandi.'
      });

      await Payment.findOneAndUpdate(
        { pickupRequest: pickup._id },
        {
          user: pickup.user,
          pickupRequest: pickup._id,
          transaction: transaction._id,
          estimatedAmount: pickup.estimatedAmount,
          finalAmount: pickup.finalAmount,
          paymentStatus: 'approved',
          paymentMethod: 'manual_transfer',
          transactionId: transaction.transactionId,
          payoutDate: new Date()
        },
        { upsert: true, new: true }
      );

      await User.findByIdAndUpdate(pickup.user, {
        $inc: {
          'stats.totalKg': pickup.actualWeight || 0,
          'stats.totalEarnings': pickup.finalAmount || 0,
          'stats.completedPickups': 1
        }
      });
    }

    await Promise.all([
      notifyUser({
        user: pickup.user,
        title: 'Pickup statusi yangilandi',
        message: `So‘rovingiz holati: ${req.body.status}`,
        type: req.body.status === 'completed' ? 'success' : 'info',
        link: '/user/pickups'
      }),
      createAuditLog({
        actor: req.user,
        action: 'pickup_status_updated',
        entityType: 'PickupRequest',
        entityId: pickup._id,
        description: 'Haydovchi pickup statusini yangiladi.',
        metadata: { status: req.body.status }
      })
    ]);

    req.flash('success', 'Pickup statusi yangilandi.');
    return res.redirect('/collector/queue');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  dashboard,
  queue,
  history,
  updateStatus
};

