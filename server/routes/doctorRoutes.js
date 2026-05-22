import express from 'express';
import {
  getAllDoctors, getDoctorById, getDoctorByUserId,
  getDoctorsByDepartment, updateDoctor, deleteDoctor, getDoctorCount
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/count', getDoctorCount);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/user/:userId', getDoctorByUserId);
router.get('/department/:departmentId', getDoctorsByDepartment);
router.put('/:id', protect, updateDoctor);
router.delete('/:id', protect, authorize('ADMIN'), deleteDoctor);

export default router;
