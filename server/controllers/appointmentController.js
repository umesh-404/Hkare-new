import Appointment from '../models/Appointment.js';

/**
 * Helper: Flatten a populated appointment document for the frontend.
 * The frontend expects flat fields: appointmentId, patientName, doctorName,
 * patientId, doctorId at the top level of each appointment object.
 */
const flattenAppointment = (apt) => {
  if (!apt) return apt;
  const obj = apt.toJSON ? apt.toJSON() : { ...apt };

  // Flatten patient name
  if (obj.patient) {
    obj.patientName = `${obj.patient.firstName || ''} ${obj.patient.lastName || ''}`.trim();
    obj.patientDisplayId = obj.patient.patientId || obj.patient._id;
    // Also flatten user-level fields if populated
    if (obj.patient.user) {
      obj.patientEmail = obj.patient.user.email || '';
      obj.patientPhone = obj.patient.user.phoneNumber || '';
    }
  }

  // Flatten doctor name
  if (obj.doctor) {
    obj.doctorName = `${obj.doctor.firstName || ''} ${obj.doctor.lastName || ''}`.trim();
    obj.doctorDisplayId = obj.doctor.doctorId || obj.doctor._id;
    obj.doctorSpecialization = obj.doctor.specialization || '';
    if (obj.doctor.department) {
      obj.departmentName = obj.doctor.department.name || '';
    }
  }

  return obj;
};

const flattenList = (list) => list.map(flattenAppointment);

// Population options used across all queries
const populateOptions = [
  { path: 'patient', populate: { path: 'user', select: '-password' } },
  { path: 'doctor', populate: [{ path: 'user', select: '-password' }, { path: 'department' }] },
  { path: 'department' }
];

// @desc    Get all appointments
// @route   GET /api/appointments
export const getAllAppointments = async (req, res, next) => {
  try {
    const { status, doctorId, patientId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctor = doctorId;
    if (patientId) filter.patient = patientId;

    const appointments = await Appointment.find(filter)
      .populate(populateOptions[0])
      .populate(populateOptions[1])
      .populate(populateOptions[2])
      .sort({ appointmentDate: -1 });

    res.json(flattenList(appointments));
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate(populateOptions[0])
      .populate(populateOptions[1])
      .populate(populateOptions[2]);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json(flattenAppointment(appointment));
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments by patient ID (patientId string)
// @route   GET /api/appointments/patient/:patientId
export const getAppointmentsByPatientId = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.params.patientId })
      .populate(populateOptions[0])
      .populate(populateOptions[1])
      .populate(populateOptions[2])
      .sort({ appointmentDate: -1 });

    res.json(flattenList(appointments));
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments by doctor ID
// @route   GET /api/appointments/doctor/:doctorId
export const getAppointmentsByDoctorId = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctor: req.params.doctorId })
      .populate(populateOptions[0])
      .populate(populateOptions[1])
      .populate(populateOptions[2])
      .sort({ appointmentDate: -1 });

    res.json(flattenList(appointments));
  } catch (error) {
    next(error);
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
export const createAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.create(req.body);
    const populated = await Appointment.findById(appointment._id)
      .populate(populateOptions[0])
      .populate(populateOptions[1])
      .populate(populateOptions[2]);

    res.status(201).json(flattenAppointment(populated));
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    })
      .populate(populateOptions[0])
      .populate(populateOptions[1])
      .populate(populateOptions[2]);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json(flattenAppointment(appointment));
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate(populateOptions[0])
      .populate(populateOptions[1])
      .populate(populateOptions[2]);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json(flattenAppointment(appointment));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment count
// @route   GET /api/appointments/count
export const getAppointmentCount = async (req, res, next) => {
  try {
    const count = await Appointment.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    const statusCounts = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ count, todayCount, statusCounts });
  } catch (error) {
    next(error);
  }
};
