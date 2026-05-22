import express from 'express';
import { getDashboardStats, getMonthlyTrends } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/trends', protect, getMonthlyTrends);

export default router;
