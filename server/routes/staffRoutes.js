import express from 'express';
import {
  getAllStaff, getStaffById, getStaffByUserId,
  getStaffByDepartment, updateStaff, deleteStaff, getStaffCount
} from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/count', getStaffCount);
router.get('/', getAllStaff);
router.get('/:id', getStaffById);
router.get('/user/:userId', getStaffByUserId);
router.get('/department/:departmentId', getStaffByDepartment);
router.put('/:id', protect, updateStaff);
router.delete('/:id', protect, authorize('ADMIN'), deleteStaff);

export default router;
