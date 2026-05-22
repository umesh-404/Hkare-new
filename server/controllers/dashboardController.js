import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Staff from '../models/Staff.js';
import Admin from '../models/Admin.js';
import Appointment from '../models/Appointment.js';
import Department from '../models/Department.js';
import Payment from '../models/Payment.js';

/**
 * Helper: Flatten a populated appointment for dashboard display.
 */
const flattenRecentAppointment = (apt) => {
  const obj = apt.toJSON ? apt.toJSON() : { ...apt };

  if (obj.patient) {
    obj.patientName = `${obj.patient.firstName || ''} ${obj.patient.lastName || ''}`.trim();
    obj.patientDisplayId = obj.patient.patientId || obj.patient._id;
  }
  if (obj.doctor) {
    obj.doctorName = `${obj.doctor.firstName || ''} ${obj.doctor.lastName || ''}`.trim();
    obj.doctorDisplayId = obj.doctor.doctorId || obj.doctor._id;
    obj.doctorSpecialization = obj.doctor.specialization || '';
  }

  return obj;
};

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      doctorCount,
      patientCount,
      staffCount,
      adminCount,
      appointmentCount,
      departmentCount
    ] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Staff.countDocuments(),
      Admin.countDocuments(),
      Appointment.countDocuments(),
      Department.countDocuments()
    ]);

    // Today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    // Revenue
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Appointment status breakdown
    const appointmentStatusBreakdown = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent appointments — flattened for frontend
    const recentAppointmentsRaw = await Appointment.find()
      .populate({ path: 'patient', select: 'firstName lastName patientId' })
      .populate({ path: 'doctor', select: 'firstName lastName doctorId specialization' })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentAppointments = recentAppointmentsRaw.map(flattenRecentAppointment);

    res.json({
      doctorCount,
      patientCount,
      staffCount: staffCount + adminCount,
      appointmentCount,
      departmentCount,
      todayAppointments,
      totalRevenue: revenueResult[0]?.total || 0,
      appointmentStatusBreakdown,
      recentAppointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly appointment trends
// @route   GET /api/dashboard/trends
export const getMonthlyTrends = async (req, res, next) => {
  try {
    const monthlyAppointments = await Appointment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$appointmentDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'COMPLETED' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    res.json({ monthlyAppointments, monthlyRevenue });
  } catch (error) {
    next(error);
  }
};
