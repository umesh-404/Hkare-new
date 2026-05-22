import express from 'express';
import {
  getAllPrescriptions, getPrescriptionById, getPrescriptionsByPatient,
  getPrescriptionsByDoctor, createPrescription, updatePrescription,
  refillPrescription, deletePrescription
} from '../controllers/prescriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllPrescriptions);
router.get('/:id', getPrescriptionById);
router.get('/patient/:patientId', getPrescriptionsByPatient);
router.get('/doctor/:doctorId', getPrescriptionsByDoctor);
router.post('/', protect, createPrescription);
router.put('/:id', protect, updatePrescription);
router.put('/:id/refill', protect, refillPrescription);
router.delete('/:id', protect, deletePrescription);

export default router;
