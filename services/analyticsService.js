const User = require('../models/User');
const WasteCategory = require('../models/WasteCategory');
const WasteListing = require('../models/WasteListing');
const PickupRequest = require('../models/PickupRequest');
const Payment = require('../models/Payment');
const CollectionPoint = require('../models/CollectionPoint');
const Factory = require('../models/Factory');
const Transaction = require('../models/Transaction');
const { ROLES } = require('../utils/constants');

const getMonthlyBuckets = (items, key) => {
  const months = [];
  const now = new Date();

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push({
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: date.toLocaleDateString('uz-UZ', { month: 'short' }),
      value: 0
    });
  }

  items.forEach((item) => {
    const date = new Date(item[key]);
    const bucketKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const month = months.find((entry) => entry.key === bucketKey);
    if (month) {
      month.value += item.value || 1;
    }
  });

  return months;
};

const getGlobalAnalytics = async () => {
  const [
    totalUsers,
    totalCollectors,
    totalRequests,
    totalCompletedPickups,
    activePoints,
    activeFactories,
    totalPayoutRows,
    totalKgRows,
    statusRows,
    regionRows,
    categoryRows,
    monthlyRows
  ] = await Promise.all([
    User.countDocuments({ role: { $in: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.POINT_MANAGER, ROLES.FACTORY_MANAGER] } }),
    User.countDocuments({ role: ROLES.COLLECTOR }),
    PickupRequest.countDocuments(),
    PickupRequest.countDocuments({ status: 'completed' }),
    CollectionPoint.countDocuments({ status: 'active' }),
    Factory.countDocuments({ status: 'active' }),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: '$finalAmount' } } }]),
    PickupRequest.aggregate([{ $group: { _id: null, total: { $sum: '$actualWeight' } } }]),
    PickupRequest.aggregate([{ $group: { _id: '$status', value: { $sum: 1 } } }]),
    PickupRequest.aggregate([{ $group: { _id: '$region', value: { $sum: 1 } } }, { $sort: { value: -1 } }, { $limit: 5 }]),
    PickupRequest.aggregate([{ $group: { _id: '$category', value: { $sum: '$actualWeight' } } }, { $sort: { value: -1 } }]),
    PickupRequest.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          value: { $sum: 1 }
        }
      }
    ])
  ]);

  const categoryMap = new Map((await WasteCategory.find().lean()).map((item) => [String(item._id), item.name]));

  const monthlyGrowth = getMonthlyBuckets(
    monthlyRows.map((row) => ({ createdAt: new Date(row._id.year, row._id.month - 1, 1), value: row.value })),
    'createdAt'
  );

  return {
    totals: {
      totalUsers,
      totalCollectors,
      totalRequests,
      totalCompletedPickups,
      activePoints,
      activeFactories,
      totalPayouts: totalPayoutRows[0]?.total || 0,
      totalKgCollected: totalKgRows[0]?.total || 0
    },
    charts: {
      wasteByCategory: {
        labels: categoryRows.map((row) => categoryMap.get(String(row._id)) || 'Noma?lum'),
        data: categoryRows.map((row) => row.value)
      },
      monthlyGrowth: {
        labels: monthlyGrowth.map((row) => row.label),
        data: monthlyGrowth.map((row) => row.value)
      },
      requestStatuses: {
        labels: statusRows.map((row) => row._id),
        data: statusRows.map((row) => row.value)
      },
      topRegions: {
        labels: regionRows.map((row) => row._id || 'Noma?lum'),
        data: regionRows.map((row) => row.value)
      }
    }
  };
};

const getHomeStats = async () => {
  const analytics = await getGlobalAnalytics();

  return [
    { label: 'Faol foydalanuvchilar', value: analytics.totals.totalUsers, suffix: '+' },
    { label: 'Yig‘ilgan plastik', value: analytics.totals.totalKgCollected, suffix: ' kg' },
    { label: 'Faol punktlar', value: analytics.totals.activePoints, suffix: '+' },
    { label: 'Hamkor zavodlar', value: analytics.totals.activeFactories, suffix: '+' }
  ];
};

const getUserMetrics = async (userId) => {
  const [listings, pickups, payments] = await Promise.all([
    WasteListing.find({ user: userId }).populate('category').sort({ createdAt: -1 }).lean(),
    PickupRequest.find({ user: userId }).populate('category assignedCollector collectionPoint').sort({ createdAt: -1 }).lean(),
    Payment.find({ user: userId }).sort({ createdAt: -1 }).lean()
  ]);

  const totalSubmittedWaste = listings.reduce((sum, item) => sum + (item.estimatedWeight || 0), 0);
  const totalEarnings = payments.reduce((sum, item) => sum + (item.finalAmount || 0), 0);

  return {
    totals: {
      totalSubmittedWaste,
      totalEarnings,
      pendingPickups: pickups.filter((item) => ['pending', 'approved', 'assigned', 'on_the_way'].includes(item.status)).length,
      completedPickups: pickups.filter((item) => item.status === 'completed').length
    },
    listings,
    pickups,
    payments
  };
};

const getCollectorMetrics = async (collectorId) => {
  const pickups = await PickupRequest.find({ assignedCollector: collectorId })
    .populate('user category collectionPoint')
    .sort({ preferredDate: 1, createdAt: -1 })
    .lean();

  return {
    pickups,
    totals: {
      assigned: pickups.filter((item) => ['assigned', 'approved'].includes(item.status)).length,
      inTransit: pickups.filter((item) => item.status === 'on_the_way').length,
      completed: pickups.filter((item) => item.status === 'completed').length,
      todayQueue: pickups.filter((item) => {
        if (!item.preferredDate) return false;
        const today = new Date();
        const preferred = new Date(item.preferredDate);
        return preferred.toDateString() === today.toDateString();
      }).length,
      totalCollectedKg: pickups.reduce((sum, item) => sum + (item.actualWeight || 0), 0)
    }
  };
};

const getPointMetrics = async (managerId) => {
  const point = await CollectionPoint.findOne({ manager: managerId }).populate('acceptedCategories').lean();
  const pickups = point
    ? await PickupRequest.find({ collectionPoint: point._id }).populate('user category factory').sort({ createdAt: -1 }).lean()
    : [];

  return {
    point,
    pickups,
    totals: {
      incoming: pickups.filter((item) => ['collected', 'delivered_to_point'].includes(item.status)).length,
      completed: pickups.filter((item) => item.status === 'completed').length,
      storedKg: point?.storedKg || 0,
      capacityKg: point?.capacityKg || 0
    }
  };
};

const getFactoryMetrics = async (managerId) => {
  const factory = await Factory.findOne({ manager: managerId }).populate('purchasePrices.category acceptedCategories').lean();
  const pickups = factory
    ? await PickupRequest.find({ factory: factory._id }).populate('user category collectionPoint').sort({ createdAt: -1 }).lean()
    : [];

  return {
    factory,
    pickups,
    totals: {
      incoming: pickups.filter((item) => item.status === 'delivered_to_factory').length,
      completed: pickups.filter((item) => item.status === 'completed').length,
      processedKg: factory?.processedKg || 0,
      suppliers: new Set(pickups.map((item) => String(item.user?._id || item.user))).size
    }
  };
};

const getAdminTables = async () => {
  const [users, roles, categories, pickups, transactions, payments, points, factories, contacts, posts] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean(),
    require('../models/Role').find().sort({ createdAt: 1 }).lean(),
    WasteCategory.find().sort({ sortOrder: 1, name: 1 }).lean(),
    PickupRequest.find().populate('user category assignedCollector collectionPoint factory').sort({ createdAt: -1 }).lean(),
    Transaction.find().populate('sourceUser sourcePoint destinationFactory').sort({ createdAt: -1 }).lean(),
    Payment.find().populate('user pickupRequest').sort({ createdAt: -1 }).lean(),
    CollectionPoint.find().populate('manager acceptedCategories').sort({ createdAt: -1 }).lean(),
    Factory.find().populate('manager acceptedCategories purchasePrices.category').sort({ createdAt: -1 }).lean(),
    require('../models/ContactMessage').find().sort({ createdAt: -1 }).lean(),
    require('../models/BlogPost').find().populate('author').sort({ createdAt: -1 }).lean()
  ]);

  return { users, roles, categories, pickups, transactions, payments, points, factories, contacts, posts };
};

module.exports = {
  getGlobalAnalytics,
  getHomeStats,
  getUserMetrics,
  getCollectorMetrics,
  getPointMetrics,
  getFactoryMetrics,
  getAdminTables
};

