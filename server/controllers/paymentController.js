import Payment from '../models/Payment.js';

// @desc    Get all payments
// @route   GET /api/payments
export const getAllPayments = async (req, res, next) => {
  try {
    const { status, patientId, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (patientId) filter.patient = patientId;
    if (type) filter.type = type;

    const payments = await Payment.find(filter)
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate('appointment')
      .populate({ path: 'receivedBy', populate: { path: 'user', select: '-password' } })
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate('appointment')
      .populate({ path: 'receivedBy', populate: { path: 'user', select: '-password' } });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get payments by patient
// @route   GET /api/payments/patient/:patientId
export const getPaymentsByPatient = async (req, res, next) => {
  try {
    const payments = await Payment.find({ patient: req.params.patientId })
      .populate('appointment')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Create payment
// @route   POST /api/payments
export const createPayment = async (req, res, next) => {
  try {
    const payment = await Payment.create(req.body);
    const populated = await Payment.findById(payment._id)
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate('appointment');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment
// @route   PUT /api/payments/:id
export const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    })
      .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
      .populate('appointment');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id, { status }, { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
export const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue statistics
// @route   GET /api/payments/stats/revenue
export const getRevenueStats = async (req, res, next) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
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

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue
    });
  } catch (error) {
    next(error);
  }
};
