const {
  PICKUP_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  LISTING_STATUS_LABELS,
  ROLE_LABELS
} = require('./constants');

const currencyFormatter = new Intl.NumberFormat('uz-UZ');

const statusClassMap = {
  pending: 'badge-soft-warning',
  approved: 'badge-soft-info',
  assigned: 'badge-soft-primary',
  on_the_way: 'badge-soft-accent',
  collected: 'badge-soft-success',
  delivered_to_point: 'badge-soft-cyan',
  delivered_to_factory: 'badge-soft-indigo',
  completed: 'badge-soft-success',
  rejected: 'badge-soft-danger',
  cancelled: 'badge-soft-muted',
  paid: 'badge-soft-success',
  failed: 'badge-soft-danger',
  draft: 'badge-soft-muted',
  submitted: 'badge-soft-primary',
  in_review: 'badge-soft-warning',
  sold: 'badge-soft-success'
};

const formatCurrency = (value = 0) => `${currencyFormatter.format(Number(value || 0))} so'm`;
const formatKg = (value = 0) => `${currencyFormatter.format(Number(value || 0))} kg`;

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('uz-UZ', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(new Date(value))
    : '-';

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat('uz-UZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(value))
    : '-';

const formatStatus = (status) =>
  PICKUP_STATUS_LABELS[status] || PAYMENT_STATUS_LABELS[status] || LISTING_STATUS_LABELS[status] || status;

const statusBadgeClass = (status) => statusClassMap[status] || 'badge-soft-primary';
const formatRole = (role) => ROLE_LABELS[role] || role;

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

module.exports = {
  formatCurrency,
  formatKg,
  formatDate,
  formatDateTime,
  formatStatus,
  statusBadgeClass,
  formatRole,
  initials
};
