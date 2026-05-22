import express from 'express';
import {
  getNotificationsByUser, getUnreadCount, createNotification,
  markAsRead, markAllAsRead, deleteNotification
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/user/:userId', protect, getNotificationsByUser);
router.get('/unread/:userId', protect, getUnreadCount);
router.post('/', protect, createNotification);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all/:userId', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
