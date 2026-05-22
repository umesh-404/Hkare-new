import express from 'express';
import {
  getAllPatients, getPatientById, getPatientByUserId,
  getPatientsByDoctor, updatePatient, deletePatient, getPatientCount
} from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/count', getPatientCount);
router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.get('/user/:userId', getPatientByUserId);
router.get('/doctor/:doctorId', getPatientsByDoctor);
router.put('/:id', protect, updatePatient);
router.delete('/:id', protect, authorize('ADMIN'), deletePatient);

export default router;
