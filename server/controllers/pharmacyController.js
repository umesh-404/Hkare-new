import Pharmacy from '../models/Pharmacy.js';

// @desc    Get all pharmacies
// @route   GET /api/pharmacies
export const getAllPharmacies = async (req, res, next) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';

    const pharmacies = await Pharmacy.find(filter).sort({ name: 1 });
    res.json(pharmacies);
  } catch (error) {
    next(error);
  }
};

// @desc    Get pharmacy by ID
// @route   GET /api/pharmacies/:id
export const getPharmacyById = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    next(error);
  }
};

// @desc    Create pharmacy
// @route   POST /api/pharmacies
export const createPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.create(req.body);
    res.status(201).json(pharmacy);
  } catch (error) {
    next(error);
  }
};

// @desc    Update pharmacy
// @route   PUT /api/pharmacies/:id
export const updatePharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete pharmacy
// @route   DELETE /api/pharmacies/:id
export const deletePharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }
    res.json({ success: true, message: 'Pharmacy deleted successfully' });
  } catch (error) {
    next(error);
  }
};
