import express from 'express';
import {
  getAllMedicalRecords, getMedicalRecordById, getMedicalRecordsByPatient,
  getMedicalRecordsByDoctor, createMedicalRecord, updateMedicalRecord,
  deleteMedicalRecord
} from '../controllers/medicalRecordController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllMedicalRecords);
router.get('/:id', getMedicalRecordById);
router.get('/patient/:patientId', getMedicalRecordsByPatient);
router.get('/doctor/:doctorId', getMedicalRecordsByDoctor);
router.post('/', protect, createMedicalRecord);
router.put('/:id', protect, updateMedicalRecord);
router.delete('/:id', protect, deleteMedicalRecord);

export default router;
