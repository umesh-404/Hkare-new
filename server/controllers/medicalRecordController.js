import MedicalRecord from '../models/MedicalRecord.js';

// @desc    Get all medical records
// @route   GET /api/medical-records
export const getAllMedicalRecords = async (req, res, next) => {
  try {
    const { patientId, doctorId, recordType } = req.query;
    const filter = {};
    if (patientId) filter.patient = patientId;
    if (doctorId) filter.doctor = doctorId;
    if (recordType) filter.recordType = recordType;

    const records = await MedicalRecord.find(filter)
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
      .populate('appointment')
      .sort({ recordDate: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Get medical record by ID
// @route   GET /api/medical-records/:id
export const getMedicalRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
      .populate('appointment');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
};

// @desc    Get medical records by patient
// @route   GET /api/medical-records/patient/:patientId
export const getMedicalRecordsByPatient = async (req, res, next) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
      .populate('appointment')
      .sort({ recordDate: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Get medical records by doctor
// @route   GET /api/medical-records/doctor/:doctorId
export const getMedicalRecordsByDoctor = async (req, res, next) => {
  try {
    const records = await MedicalRecord.find({ doctor: req.params.doctorId })
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate('appointment')
      .sort({ recordDate: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Create medical record
// @route   POST /api/medical-records
export const createMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.create(req.body);
    const populated = await MedicalRecord.findById(record._id)
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
      .populate('appointment');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
export const updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    })
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
      .populate('appointment');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medical record
// @route   DELETE /api/medical-records/:id
export const deleteMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }
    res.json({ success: true, message: 'Medical record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
