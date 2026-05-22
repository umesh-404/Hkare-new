import Prescription from '../models/Prescription.js';

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
export const getAllPrescriptions = async (req, res, next) => {
  try {
    const { patientId, doctorId, status } = req.query;
    const filter = {};
    if (patientId) filter.patient = patientId;
    if (doctorId) filter.doctor = doctorId;
    if (status) filter.status = status;

    const prescriptions = await Prescription.find(filter)
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
      .populate('medicalRecord')
      .populate('pharmacy')
      .sort({ prescriptionDate: -1 });
    res.json(prescriptions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescription by ID
// @route   GET /api/prescriptions/:id
export const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
      .populate('medicalRecord')
      .populate('pharmacy');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json(prescription);
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescriptions by patient
// @route   GET /api/prescriptions/patient/:patientId
export const getPrescriptionsByPatient = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
      .populate('pharmacy')
      .sort({ prescriptionDate: -1 });
    res.json(prescriptions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescriptions by doctor
// @route   GET /api/prescriptions/doctor/:doctorId
export const getPrescriptionsByDoctor = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.params.doctorId })
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate('pharmacy')
      .sort({ prescriptionDate: -1 });
    res.json(prescriptions);
  } catch (error) {
    next(error);
  }
};

// @desc    Create prescription
// @route   POST /api/prescriptions
export const createPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.create(req.body);
    const populated = await Prescription.findById(prescription._id)
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
      .populate('medicalRecord')
      .populate('pharmacy');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
export const updatePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    })
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
      .populate('medicalRecord')
      .populate('pharmacy');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json(prescription);
  } catch (error) {
    next(error);
  }
};

// @desc    Refill prescription
// @route   PUT /api/prescriptions/:id/refill
export const refillPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (!prescription.isRefillable) {
      return res.status(400).json({ success: false, message: 'Prescription is not refillable' });
    }

    if (prescription.refillsRemaining <= 0) {
      return res.status(400).json({ success: false, message: 'No refills remaining' });
    }

    prescription.refillsRemaining -= 1;
    if (prescription.refillsRemaining === 0) {
      prescription.status = 'COMPLETED';
    }

    await prescription.save();
    res.json(prescription);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
export const deletePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    next(error);
  }
};
