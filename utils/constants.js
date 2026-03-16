const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  COLLECTOR: 'collector',
  POINT_MANAGER: 'point_manager',
  FACTORY_MANAGER: 'factory_manager'
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.USER]: 'Sotuvchi',
  [ROLES.COLLECTOR]: 'Haydovchi',
  [ROLES.POINT_MANAGER]: 'Punkt menejeri',
  [ROLES.FACTORY_MANAGER]: 'Zavod menejeri'
};

const PICKUP_STATUSES = [
  'pending',
  'approved',
  'assigned',
  'on_the_way',
  'collected',
  'delivered_to_point',
  'delivered_to_factory',
  'completed',
  'rejected',
  'cancelled'
];

const PICKUP_STATUS_LABELS = {
  pending: 'Kutilmoqda',
  approved: 'Tasdiqlandi',
  assigned: 'Biriktirildi',
  on_the_way: "Yo'lda",
  collected: "Yig'ib olindi",
  delivered_to_point: 'Punktga yetkazildi',
  delivered_to_factory: 'Zavodga yetkazildi',
  completed: 'Yakunlandi',
  rejected: 'Rad etildi',
  cancelled: 'Bekor qilindi'
};

const PAYMENT_STATUSES = ['pending', 'approved', 'paid', 'failed'];

const PAYMENT_STATUS_LABELS = {
  pending: 'Kutilmoqda',
  approved: 'Tasdiqlandi',
  paid: "To'landi",
  failed: 'Muvaffaqiyatsiz'
};

const LISTING_STATUSES = ['draft', 'submitted', 'in_review', 'approved', 'sold', 'completed', 'cancelled'];

const LISTING_STATUS_LABELS = {
  draft: 'Qoralama',
  submitted: 'Yuborildi',
  in_review: "Ko'rib chiqilmoqda",
  approved: 'Tasdiqlandi',
  sold: 'Sotildi',
  completed: 'Yakunlandi',
  cancelled: 'Bekor qilindi'
};

const NOTIFICATION_TYPES = ['success', 'info', 'warning', 'announcement'];

const DASHBOARD_ROUTES = {
  [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.USER]: '/user/dashboard',
  [ROLES.COLLECTOR]: '/collector/dashboard',
  [ROLES.POINT_MANAGER]: '/point-manager/dashboard',
  [ROLES.FACTORY_MANAGER]: '/factory/dashboard'
};

const DEFAULT_COORDINATES = [69.2401, 41.2995];

module.exports = {
  ROLES,
  ROLE_LABELS,
  PICKUP_STATUSES,
  PICKUP_STATUS_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  NOTIFICATION_TYPES,
  DASHBOARD_ROUTES,
  DEFAULT_COORDINATES
};
