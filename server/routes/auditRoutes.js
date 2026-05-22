import express from 'express';
import {
  getAllAuditLogs, getAuditLogsByUser, getAuditLogsByEntity,
  getAuditLogsByAction, getAuditLogsByDateRange,
  createAuditLog, deleteAuditLog,
  getAllLoginHistory, getLoginHistoryByUser, getLoginHistoryByDateRange
} from '../controllers/auditController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== Audit Logs ====================
// Specific routes MUST come before parameterized routes
router.get('/audit-logs/user/:username', protect, authorize('ADMIN'), getAuditLogsByUser);
router.get('/audit-logs/entity', protect, authorize('ADMIN'), getAuditLogsByEntity);
router.get('/audit-logs/action/:action', protect, authorize('ADMIN'), getAuditLogsByAction);
router.get('/audit-logs/date-range', protect, authorize('ADMIN'), getAuditLogsByDateRange);
router.get('/audit-logs', protect, authorize('ADMIN'), getAllAuditLogs);
router.post('/audit-logs', protect, createAuditLog);
router.delete('/audit-logs/:id', protect, authorize('ADMIN'), deleteAuditLog);

// ==================== Login History ====================
router.get('/login-history/user/:username', protect, getLoginHistoryByUser);
router.get('/login-history/date-range', protect, authorize('ADMIN'), getLoginHistoryByDateRange);
router.get('/login-history', protect, authorize('ADMIN'), getAllLoginHistory);

export default router;
