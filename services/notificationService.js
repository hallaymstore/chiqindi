const Notification = require('../models/Notification');

const notifyUser = async ({ user, title, message, type = 'info', link = '', metadata = {} }) =>
  Notification.create({
    user,
    title,
    message,
    type,
    link,
    metadata
  });

const notifyRole = async ({ role, title, message, type = 'announcement', link = '', metadata = {} }) =>
  Notification.create({
    role,
    title,
    message,
    type,
    link,
    metadata
  });

module.exports = {
  notifyUser,
  notifyRole
};
