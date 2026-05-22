import AuditLog from '../models/AuditLog.js';
import LoginHistory from '../models/LoginHistory.js';

// @desc    Get all audit logs
// @route   GET /api/audit-logs
export const getAllAuditLogs = async (req, res, next) => {
  try {
    const { username, entityType, limit: queryLimit } = req.query;
    const filter = {};
    if (username) filter.username = username;
    if (entityType) filter.entityType = entityType;

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(queryLimit) || 100);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs by username
// @route   GET /api/audit-logs/user/:username
export const getAuditLogsByUser = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({ username: req.params.username })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs by entity type and ID
// @route   GET /api/audit-logs/entity?entityType=X&entityId=Y
export const getAuditLogsByEntity = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.query;
    const filter = {};
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs by action
// @route   GET /api/audit-logs/action/:action
export const getAuditLogsByAction = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({ action: req.params.action })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs by date range
// @route   GET /api/audit-logs/date-range?start=X&end=Y
export const getAuditLogsByDateRange = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const filter = {};

    if (start || end) {
      filter.timestamp = {};
      if (start) filter.timestamp.$gte = new Date(start);
      if (end) filter.timestamp.$lte = new Date(end);
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(200);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// @desc    Create audit log
// @route   POST /api/audit-logs
export const createAuditLog = async (req, res, next) => {
  try {
    const log = await AuditLog.create({
      ...req.body,
      ipAddress: req.body.ipAddress || req.ip || 'unknown'
    });
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete audit log
// @route   DELETE /api/audit-logs/:id
export const deleteAuditLog = async (req, res, next) => {
  try {
    const log = await AuditLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }
    res.json({ success: true, message: 'Audit log deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==================== Login History ====================

// @desc    Get all login history
// @route   GET /api/login-history
export const getAllLoginHistory = async (req, res, next) => {
  try {
    const { username, success, limit: queryLimit } = req.query;
    const filter = {};
    if (username) filter.username = username;
    if (success !== undefined) filter.loginSuccess = success === 'true';

    const history = await LoginHistory.find(filter)
      .sort({ loginTime: -1 })
      .limit(parseInt(queryLimit) || 100);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

// @desc    Get login history by username
// @route   GET /api/login-history/user/:username
export const getLoginHistoryByUser = async (req, res, next) => {
  try {
    const history = await LoginHistory.find({ username: req.params.username })
      .sort({ loginTime: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

// @desc    Get login history by date range
// @route   GET /api/login-history/date-range?start=X&end=Y
export const getLoginHistoryByDateRange = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const filter = {};

    if (start || end) {
      filter.loginTime = {};
      if (start) filter.loginTime.$gte = new Date(start);
      if (end) filter.loginTime.$lte = new Date(end);
    }

    const history = await LoginHistory.find(filter)
      .sort({ loginTime: -1 })
      .limit(200);
    res.json(history);
  } catch (error) {
    next(error);
  }
};
