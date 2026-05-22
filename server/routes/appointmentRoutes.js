import express from 'express';
import {
  getAllAppointments, getAppointmentById, getAppointmentsByPatientId,
  getAppointmentsByDoctorId, createAppointment, updateAppointment,
  updateAppointmentStatus, deleteAppointment, getAppointmentCount
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/count', getAppointmentCount);
router.get('/', getAllAppointments);
router.get('/:id', getAppointmentById);
router.get('/patient/:patientId', getAppointmentsByPatientId);
router.get('/doctor/:doctorId', getAppointmentsByDoctorId);
router.post('/', protect, createAppointment);
router.put('/:id', protect, updateAppointment);
router.put('/:id/status', protect, updateAppointmentStatus);
router.delete('/:id', protect, deleteAppointment);

export default router;
