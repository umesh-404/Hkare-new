import express from 'express';
import {
  getAllPayments, getPaymentById, getPaymentsByPatient,
  createPayment, updatePayment, updatePaymentStatus,
  deletePayment, getRevenueStats
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats/revenue', protect, getRevenueStats);
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.get('/patient/:patientId', getPaymentsByPatient);
router.post('/', protect, createPayment);
router.put('/:id', protect, updatePayment);
router.put('/:id/status', protect, updatePaymentStatus);
router.delete('/:id', protect, deletePayment);

export default router;
