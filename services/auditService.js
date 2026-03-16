const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({ actor, action, entityType, entityId, description, metadata = {} }) => {
  try {
    await AuditLog.create({
      actor: actor?._id,
      actorName: actor?.name || 'System',
      action,
      entityType,
      entityId: entityId ? String(entityId) : undefined,
      description,
      metadata
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

module.exports = {
  createAuditLog
};
