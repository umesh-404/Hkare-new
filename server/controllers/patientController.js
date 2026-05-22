import Patient from '../models/Patient.js';
import User from '../models/User.js';

/**
 * Helper: Flatten a populated patient document for the frontend.
 */
const flattenPatient = (doc) => {
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

  if (obj.primaryDoctor && typeof obj.primaryDoctor === 'object') {
    obj.primaryDoctorName = `${obj.primaryDoctor.firstName || ''} ${obj.primaryDoctor.lastName || ''}`.trim();
    obj.primaryDoctorId = obj.primaryDoctor.doctorId || obj.primaryDoctor._id;
  }

  return obj;
};

const flattenList = (list) => list.map(flattenPatient);

// @desc    Get all patients
// @route   GET /api/patients
export const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find()
      .populate('user', '-password')
      .populate({ path: 'primaryDoctor', populate: { path: 'department' } });
    res.json(flattenList(patients));
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient by patientId
// @route   GET /api/patients/:id
export const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id })
      .populate('user', '-password')
      .populate({ path: 'primaryDoctor', populate: { path: 'department' } });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json(flattenPatient(patient));
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient by user ID
// @route   GET /api/patients/user/:userId
export const getPatientByUserId = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.params.userId })
      .populate('user', '-password')
      .populate({ path: 'primaryDoctor', populate: { path: 'department' } });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json(flattenPatient(patient));
  } catch (error) {
    next(error);
  }
};

// @desc    Get patients by doctor
// @route   GET /api/patients/doctor/:doctorId
export const getPatientsByDoctor = async (req, res, next) => {
  try {
    const patients = await Patient.find({ primaryDoctor: req.params.doctorId })
      .populate('user', '-password');
    res.json(flattenList(patients));
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const allowedFields = [
      'firstName', 'lastName', 'bloodGroup', 'height', 'weight',
      'allergies', 'emergencyContactName', 'emergencyContactPhone',
      'insuranceProvider', 'insuranceId', 'primaryDoctor'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    });

    if (req.body.phoneNumber || req.body.address || req.body.gender || req.body.dateOfBirth || req.body.profilePictureUrl) {
      const user = await User.findById(patient.user);
      if (user) {
        if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;
        if (req.body.address) user.address = req.body.address;
        if (req.body.gender) user.gender = req.body.gender;
        if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
        if (req.body.profilePictureUrl) user.profilePictureUrl = req.body.profilePictureUrl;
        await user.save();
      }
    }

    await patient.save();

    const updatedPatient = await Patient.findOne({ patientId: req.params.id })
      .populate('user', '-password')
      .populate({ path: 'primaryDoctor', populate: { path: 'department' } });

    res.json(flattenPatient(updatedPatient));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
export const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await User.findByIdAndUpdate(patient.user, { isActive: false });
    await Patient.deleteOne({ patientId: req.params.id });

    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient count
// @route   GET /api/patients/count
export const getPatientCount = async (req, res, next) => {
  try {
    const count = await Patient.countDocuments();
    res.json({ count });
  } catch (error) {
    next(error);
  }
};
