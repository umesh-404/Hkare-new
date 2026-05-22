import express from 'express';
import {
  registerDoctor, loginDoctor,
  registerPatient, loginPatient,
  registerStaff, loginStaff,
  loginAdmin
} from '../controllers/authController.js';
import LoginHistory from '../models/LoginHistory.js';

const router = express.Router();

// Doctor auth routes — matches frontend /api/auth/doctor/*
router.post('/auth/doctor/register', registerDoctor);
router.post('/auth/doctor/login', loginDoctor);

// Patient auth routes — matches frontend /api/auth/patient/*
router.post('/auth/patient/register', registerPatient);
router.post('/auth/patient/login', loginPatient);

// Staff/Admin auth routes — matches frontend /api/auth/staff/*
router.post('/auth/staff/register', registerStaff);
router.post('/auth/staff/login', loginStaff);

// Hardcoded admin login
router.post('/auth/admin/login', loginAdmin);

// Login history — frontend POSTs to /api/login-history
router.post('/login-history', async (req, res, next) => {
  try {
    const log = await LoginHistory.create({
      username: req.body.username,
      ipAddress: req.body.ipAddress || req.ip || 'unknown',
      userAgent: req.body.userAgent || req.headers['user-agent'] || 'unknown',
      loginSuccess: req.body.loginSuccess,
      failureReason: req.body.failureReason || ''
    });
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

export default router;
