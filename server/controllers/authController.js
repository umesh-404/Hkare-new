import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Staff from '../models/Staff.js';
import Admin from '../models/Admin.js';
import LoginHistory from '../models/LoginHistory.js';
import { generateToken } from '../middleware/authMiddleware.js';

// Helper: generate unique IDs (replaces IDGeneratorService.java)
const generateId = async (prefix, Model, idField) => {
  const count = await Model.countDocuments();
  const num = (count + 1).toString().padStart(4, '0');
  return `${prefix}${num}`;
};

// Helper: resolve identifier (email or roleId) to a User
const resolveUser = async (identifier, userType, RoleModel, roleIdField) => {
  // First try as email
  let user = await User.findOne({ email: identifier, userType });

  if (!user) {
    // Try as role-specific ID (e.g. "D0001")
    const roleDoc = await RoleModel.findOne({ [roleIdField]: identifier });
    if (roleDoc) {
      user = await User.findOne({ _id: roleDoc.user, userType });
    }
  }

  return user;
};

// @desc    Register a doctor
// @route   POST /api/auth/doctor/register
export const registerDoctor = async (req, res, next) => {
  try {
    const {
      email, password, phoneNumber, address, dateOfBirth, gender,
      firstName, lastName, specialization, qualification,
      experienceYears, licenseNumber, consultationFee, bio, departmentId
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user account
    const user = await User.create({
      email, password, phoneNumber, address, dateOfBirth, gender,
      userType: 'DOCTOR'
    });

    // Generate doctor ID
    const doctorId = await generateId('D', Doctor, 'doctorId');

    // Create doctor profile
    const doctor = await Doctor.create({
      doctorId, user: user._id, firstName, lastName,
      specialization, qualification, experienceYears,
      licenseNumber, consultationFee, bio,
      department: departmentId || undefined
    });

    const token = generateToken(user._id, user.userType);

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      userId: user._id,
      roleId: doctor.doctorId,
      doctorId: doctor.doctorId,
      role: 'DOCTOR',
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login a doctor
// @route   POST /api/auth/doctor/login
export const loginDoctor = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await resolveUser(identifier, 'DOCTOR', Doctor, 'doctorId');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(200).json({
        authenticated: false,
        message: 'Invalid email/ID or password'
      });
    }

    if (!user.isActive) {
      return res.status(200).json({
        authenticated: false,
        message: 'Account is deactivated'
      });
    }

    const doctor = await Doctor.findOne({ user: user._id }).populate('department');
    const token = generateToken(user._id, user.userType);

    // Store token in localStorage via frontend
    res.json({
      authenticated: true,
      success: true,
      message: 'Login successful',
      userId: user._id,
      roleId: doctor?.doctorId,
      doctorId: doctor?.doctorId,
      email: user.email,
      firstName: doctor?.firstName,
      lastName: doctor?.lastName,
      specialization: doctor?.specialization,
      role: 'DOCTOR',
      loginTime: new Date().getTime(),
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a patient
// @route   POST /api/auth/patient/register
export const registerPatient = async (req, res, next) => {
  try {
    const {
      email, password, phoneNumber, address, dateOfBirth, gender,
      firstName, lastName, bloodGroup, height, weight, allergies,
      emergencyContactName, emergencyContactPhone,
      insuranceProvider, insuranceId
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      email, password, phoneNumber, address, dateOfBirth, gender,
      userType: 'PATIENT'
    });

    const patientId = await generateId('P', Patient, 'patientId');

    const patient = await Patient.create({
      patientId, user: user._id, firstName, lastName,
      bloodGroup, height, weight, allergies,
      emergencyContactName, emergencyContactPhone,
      insuranceProvider, insuranceId
    });

    const token = generateToken(user._id, user.userType);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      userId: user._id,
      roleId: patient.patientId,
      patientId: patient.patientId,
      role: 'PATIENT',
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login a patient
// @route   POST /api/auth/patient/login
export const loginPatient = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await resolveUser(identifier, 'PATIENT', Patient, 'patientId');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(200).json({
        authenticated: false,
        message: 'Invalid email/ID or password'
      });
    }

    if (!user.isActive) {
      return res.status(200).json({
        authenticated: false,
        message: 'Account is deactivated'
      });
    }

    const patient = await Patient.findOne({ user: user._id }).populate('primaryDoctor');
    const token = generateToken(user._id, user.userType);

    res.json({
      authenticated: true,
      success: true,
      message: 'Login successful',
      userId: user._id,
      roleId: patient?.patientId,
      patientId: patient?.patientId,
      email: user.email,
      firstName: patient?.firstName,
      lastName: patient?.lastName,
      role: 'PATIENT',
      loginTime: new Date().getTime(),
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register staff/admin
// @route   POST /api/auth/staff/register
export const registerStaff = async (req, res, next) => {
  try {
    const {
      email, password, phoneNumber, address, dateOfBirth, gender,
      firstName, lastName, position, hireDate, departmentId,
      isAdmin
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const userType = isAdmin ? 'ADMIN' : 'STAFF';

    const user = await User.create({
      email, password, phoneNumber, address, dateOfBirth, gender,
      userType
    });

    let staffRecord;
    if (isAdmin) {
      const adminId = await generateId('A', Admin, 'adminId');
      staffRecord = await Admin.create({
        adminId, user: user._id, firstName, lastName,
        position, hireDate, department: departmentId || undefined
      });
    } else {
      const staffId = await generateId('S', Staff, 'staffId');
      staffRecord = await Staff.create({
        staffId, user: user._id, firstName, lastName,
        position, hireDate, department: departmentId || undefined
      });
    }

    const token = generateToken(user._id, user.userType);

    res.status(201).json({
      success: true,
      message: `${userType} registered successfully`,
      userId: user._id,
      roleId: staffRecord.staffId || staffRecord.adminId,
      staffId: staffRecord.staffId || staffRecord.adminId,
      role: userType,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login staff/admin
// @route   POST /api/auth/staff/login
export const loginStaff = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // Try Staff first, then Admin
    let user = await resolveUser(identifier, 'STAFF', Staff, 'staffId');
    if (!user) {
      user = await resolveUser(identifier, 'ADMIN', Admin, 'adminId');
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(200).json({
        authenticated: false,
        message: 'Invalid email/ID or password'
      });
    }

    if (!user.isActive) {
      return res.status(200).json({
        authenticated: false,
        message: 'Account is deactivated'
      });
    }

    let profileRecord;
    let profileId;

    if (user.userType === 'ADMIN') {
      profileRecord = await Admin.findOne({ user: user._id }).populate('department');
      profileId = profileRecord?.adminId;
    } else {
      profileRecord = await Staff.findOne({ user: user._id }).populate('department');
      profileId = profileRecord?.staffId;
    }

    const token = generateToken(user._id, user.userType);

    res.json({
      authenticated: true,
      success: true,
      message: 'Login successful',
      userId: user._id,
      roleId: profileId,
      staffId: profileId,
      email: user.email,
      firstName: profileRecord?.firstName,
      lastName: profileRecord?.lastName,
      role: user.userType,
      loginTime: new Date().getTime(),
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login hardcoded admin
// @route   POST /api/auth/admin/login
export const loginAdmin = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (identifier === 'admin' && password === 'admin') {
      // Sign a real JWT with a special ID the protect middleware recognizes
      const token = jwt.sign(
        { id: 'HARDCODED_ADMIN', userType: 'ADMIN' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
      );

      return res.json({
        authenticated: true,
        success: true,
        message: 'Admin login successful',
        userId: 'HARDCODED_ADMIN',
        roleId: 'ADMIN001',
        email: 'admin@hkare.com',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        loginTime: new Date().getTime(),
        token
      });
    }

    return res.status(200).json({
      authenticated: false,
      message: 'Invalid admin credentials'
    });
  } catch (error) {
    next(error);
  }
};
