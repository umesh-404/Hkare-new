import express from 'express';
import {
  getAllPharmacies, getPharmacyById, createPharmacy,
  updatePharmacy, deletePharmacy
} from '../controllers/pharmacyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllPharmacies);
router.get('/:id', getPharmacyById);
router.post('/', protect, authorize('ADMIN'), createPharmacy);
router.put('/:id', protect, authorize('ADMIN'), updatePharmacy);
router.delete('/:id', protect, authorize('ADMIN'), deletePharmacy);

export default router;
