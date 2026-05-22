import Medication from '../models/Medication.js';

// @desc    Get all medications
// @route   GET /api/medications
export const getAllMedications = async (req, res, next) => {
  try {
    const { type, search, active } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } }
      ];
    }

    const medications = await Medication.find(filter).sort({ name: 1 });
    res.json(medications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get medication by ID
// @route   GET /api/medications/:id
export const getMedicationById = async (req, res, next) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    res.json(medication);
  } catch (error) {
    next(error);
  }
};

// @desc    Create medication
// @route   POST /api/medications
export const createMedication = async (req, res, next) => {
  try {
    const medication = await Medication.create(req.body);
    res.status(201).json(medication);
  } catch (error) {
    next(error);
  }
};

// @desc    Update medication
// @route   PUT /api/medications/:id
export const updateMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    res.json(medication);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medication
// @route   DELETE /api/medications/:id
export const deleteMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findByIdAndDelete(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    res.json({ success: true, message: 'Medication deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medication stock
// @route   PUT /api/medications/:id/stock
export const updateMedicationStock = async (req, res, next) => {
  try {
    const { quantity, action } = req.body; // action: 'add' or 'subtract'
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }

    if (action === 'add') {
      medication.stockQuantity += quantity;
    } else if (action === 'subtract') {
      if (medication.stockQuantity < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
      medication.stockQuantity -= quantity;
    }

    await medication.save();
    res.json(medication);
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock medications
// @route   GET /api/medications/low-stock
export const getLowStockMedications = async (req, res, next) => {
  try {
    const medications = await Medication.find({
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
      isActive: true
    });
    res.json(medications);
  } catch (error) {
    next(error);
  }
};
