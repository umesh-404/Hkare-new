import express from 'express';
import {
  getAllMedications, getMedicationById, createMedication,
  updateMedication, deleteMedication, updateMedicationStock,
  getLowStockMedications
} from '../controllers/medicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/low-stock', protect, getLowStockMedications);
router.get('/', getAllMedications);
router.get('/:id', getMedicationById);
router.post('/', protect, createMedication);
router.put('/:id', protect, updateMedication);
router.put('/:id/stock', protect, updateMedicationStock);
router.delete('/:id', protect, authorize('ADMIN'), deleteMedication);

export default router;
