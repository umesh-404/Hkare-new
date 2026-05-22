import express from 'express';
import {
  getAllDepartments, getDepartmentById, createDepartment,
  updateDepartment, deleteDepartment, getDepartmentCount
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/count', getDepartmentCount);
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.post('/', protect, authorize('ADMIN'), createDepartment);
router.put('/:id', protect, authorize('ADMIN'), updateDepartment);
router.delete('/:id', protect, authorize('ADMIN'), deleteDepartment);

export default router;
