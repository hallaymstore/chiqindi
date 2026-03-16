const { ROLES } = require('./constants');

const dashboardNavigation = {
  [ROLES.USER]: [
    { href: '/user/dashboard', label: 'Asosiy panel', icon: 'ri-dashboard-line' },
    { href: '/user/listings', label: "Chiqindi e'lonlari", icon: 'ri-recycle-line' },
    { href: '/user/listings/new', label: 'Yangi topshiruv', icon: 'ri-add-circle-line' },
    { href: '/user/pickups', label: "Pickup so'rovlari", icon: 'ri-truck-line' },
    { href: '/user/payments', label: "To'lovlar", icon: 'ri-wallet-3-line' },
    { href: '/user/favorites', label: 'Sevimli punktlar', icon: 'ri-map-pin-user-line' },
    { href: '/user/ai-aniqlash', label: "Surat bo'yicha tavsiya", icon: 'ri-brain-line' }
  ],
  [ROLES.COLLECTOR]: [
    { href: '/collector/dashboard', label: 'Asosiy panel', icon: 'ri-dashboard-line' },
    { href: '/collector/queue', label: 'Kunlik navbat', icon: 'ri-route-line' },
    { href: '/collector/history', label: 'Tarix', icon: 'ri-history-line' }
  ],
  [ROLES.POINT_MANAGER]: [
    { href: '/point-manager/dashboard', label: 'Asosiy panel', icon: 'ri-dashboard-line' },
    { href: '/point-manager/inventory', label: 'Inventar', icon: 'ri-archive-stack-line' },
    { href: '/point-manager/transfers', label: "Zavodga o'tkazish", icon: 'ri-exchange-funds-line' }
  ],
  [ROLES.FACTORY_MANAGER]: [
    { href: '/factory/dashboard', label: 'Asosiy panel', icon: 'ri-dashboard-line' },
    { href: '/factory/incoming', label: 'Kelib tushayotganlar', icon: 'ri-inbox-archive-line' },
    { href: '/factory/suppliers', label: "Ta'minotchilar", icon: 'ri-team-line' }
  ],
  [ROLES.ADMIN]: [
    { href: '/admin/dashboard', label: 'Asosiy panel', icon: 'ri-dashboard-line' },
    { href: '/admin/users', label: 'Foydalanuvchilar', icon: 'ri-group-line' },
    { href: '/admin/roles', label: 'Rollar', icon: 'ri-shield-user-line' },
    { href: '/admin/categories', label: 'Chiqindi turlari', icon: 'ri-stack-line' },
    { href: '/admin/pickups', label: "Pickup so'rovlari", icon: 'ri-truck-line' },
    { href: '/admin/transactions', label: 'Tranzaksiyalar', icon: 'ri-exchange-dollar-line' },
    { href: '/admin/payments', label: "To'lovlar", icon: 'ri-wallet-3-line' },
    { href: '/admin/collection-points', label: 'Punktlar', icon: 'ri-map-pin-line' },
    { href: '/admin/factories', label: 'Zavodlar', icon: 'ri-building-line' },
    { href: '/admin/content', label: 'Kontent', icon: 'ri-layout-4-line' },
    { href: '/admin/blog', label: 'Blog', icon: 'ri-article-line' },
    { href: '/admin/notifications', label: 'Bildirishnomalar', icon: 'ri-notification-3-line' },
    { href: '/admin/reports', label: 'Hisobotlar', icon: 'ri-bar-chart-box-line' },
    { href: '/admin/settings', label: 'Sozlamalar', icon: 'ri-settings-4-line' },
    { href: '/admin/contacts', label: 'Murojaatlar', icon: 'ri-customer-service-2-line' },
    { href: '/admin/faq', label: 'FAQ', icon: 'ri-question-line' }
  ],
  [ROLES.SUPER_ADMIN]: [
    { href: '/super-admin/dashboard', label: 'Asosiy panel', icon: 'ri-dashboard-line' },
    { href: '/super-admin/admins', label: 'Adminlar', icon: 'ri-admin-line' },
    { href: '/super-admin/system-settings', label: 'Tizim sozlamalari', icon: 'ri-settings-5-line' },
    { href: '/super-admin/commissions', label: 'Komissiyalar', icon: 'ri-percent-line' },
    { href: '/super-admin/audit-logs', label: 'Audit loglar', icon: 'ri-file-list-3-line' },
    { href: '/super-admin/permissions', label: 'Ruxsatlar', icon: 'ri-lock-password-line' },
    { href: '/super-admin/analytics', label: 'Analitika', icon: 'ri-line-chart-line' }
  ]
};

const publicNavigation = [
  { href: '/', label: 'Bosh sahifa' },
  { href: '/haqida', label: 'Loyiha haqida' },
  { href: '/qanday-ishlaydi', label: 'Qanday ishlaydi' },
  { href: '/punktlar', label: 'Punktlar xaritasi' },
  { href: '/hamkor-zavodlar', label: 'Hamkorlar' },
  { href: '/narxlar', label: 'Narxlar' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/aloqa', label: 'Aloqa' }
];

module.exports = {
  dashboardNavigation,
  publicNavigation
};

