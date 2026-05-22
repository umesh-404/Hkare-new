import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

/**
 * Helper: Flatten a populated doctor document for the frontend.
 * The frontend expects flat fields: email, phoneNumber, gender, etc.
 * at the top level instead of nested under .user
 */
const flattenDoctor = (doc) => {
  if (!doc) return doc;
  const obj = doc.toJSON ? doc.toJSON() : { ...doc };

  if (obj.user) {
    obj.email = obj.user.email || '';
    obj.phoneNumber = obj.user.phoneNumber || '';
    obj.address = obj.user.address || '';
    obj.gender = obj.user.gender || '';
    obj.dateOfBirth = obj.user.dateOfBirth || null;
    obj.profilePictureUrl = obj.user.profilePictureUrl || '';
    obj.isActive = obj.user.isActive !== undefined ? obj.user.isActive : true;
    obj.userId = obj.user._id || obj.user.id;
  }

  if (obj.department && typeof obj.department === 'object') {
    obj.departmentName = obj.department.name || '';
  }

  return obj;
};

const flattenList = (list) => list.map(flattenDoctor);

// @desc    Get all doctors
// @route   GET /api/doctors
export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', '-password')
      .populate('department');
    res.json(flattenList(doctors));
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor by doctorId
// @route   GET /api/doctors/:id
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ doctorId: req.params.id })
      .populate('user', '-password')
      .populate('department');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json(flattenDoctor(doctor));
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor by user ID
// @route   GET /api/doctors/user/:userId
export const getDoctorByUserId = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.userId })
      .populate('user', '-password')
      .populate('department');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json(flattenDoctor(doctor));
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctors by department
// @route   GET /api/doctors/department/:departmentId
export const getDoctorsByDepartment = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ department: req.params.departmentId })
      .populate('user', '-password')
      .populate('department');
    res.json(flattenList(doctors));
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ doctorId: req.params.id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Update doctor fields
    const allowedFields = [
      'firstName', 'lastName', 'specialization', 'qualification',
      'experienceYears', 'licenseNumber', 'consultationFee', 'bio',
      'rating', 'department'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    // Update associated user fields if provided
    if (req.body.phoneNumber || req.body.address || req.body.gender || req.body.dateOfBirth || req.body.profilePictureUrl) {
      const user = await User.findById(doctor.user);
      if (user) {
        if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;
        if (req.body.address) user.address = req.body.address;
        if (req.body.gender) user.gender = req.body.gender;
        if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
        if (req.body.profilePictureUrl) user.profilePictureUrl = req.body.profilePictureUrl;
        await user.save();
      }
    }

    await doctor.save();

    const updatedDoctor = await Doctor.findOne({ doctorId: req.params.id })
      .populate('user', '-password')
      .populate('department');

    res.json(flattenDoctor(updatedDoctor));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ doctorId: req.params.id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Deactivate user instead of hard delete
    await User.findByIdAndUpdate(doctor.user, { isActive: false });
    await Doctor.deleteOne({ doctorId: req.params.id });

    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor count
// @route   GET /api/doctors/count
export const getDoctorCount = async (req, res, next) => {
  try {
    const count = await Doctor.countDocuments();
    res.json({ count });
  } catch (error) {
    next(error);
  }
};
