const mongoose = require('mongoose');
const { NOTIFICATION_TYPES, ROLES } = require('../utils/constants');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: Object.values(ROLES)
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: 'info'
    },
    link: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
