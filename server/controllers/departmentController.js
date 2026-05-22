import Department from '../models/Department.js';

/**
 * Helper: Flatten a populated department document for the frontend.
 */
const flattenDepartment = (doc) => {
  if (!doc) return doc;
  const obj = doc.toJSON ? doc.toJSON() : { ...doc };

  if (obj.headDoctor && typeof obj.headDoctor === 'object') {
    const user = obj.headDoctor.user || {};
    obj.headDoctorName = `Dr. ${user.firstName || ''} ${user.lastName || ''}`.trim();
    obj.headDoctorId = obj.headDoctor.doctorId || obj.headDoctor._id || obj.headDoctor.id;
  } else {
    obj.headDoctorName = null;
    obj.headDoctorId = null;
  }

  // Adding stub counts/booleans expected by some views
  obj.isActive = obj.isActive !== undefined ? obj.isActive : true;
  obj.staffCount = obj.staffCount || 0;

  return obj;
};

const flattenList = (list) => list.map(flattenDepartment);

// @desc    Get all departments
// @route   GET /api/departments
export const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate({ path: 'headDoctor', populate: { path: 'user', select: '-password' } });
    res.json(flattenList(departments));
  } catch (error) {
    next(error);
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate({ path: 'headDoctor', populate: { path: 'user', select: '-password' } });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json(flattenDepartment(department));
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
export const createDepartment = async (req, res, next) => {
  try {
    let department = await Department.create(req.body);
    department = await department.populate({ path: 'headDoctor', populate: { path: 'user', select: '-password' } });
    res.status(201).json(flattenDepartment(department));
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate({ path: 'headDoctor', populate: { path: 'user', select: '-password' } });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json(flattenDepartment(department));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department count
// @route   GET /api/departments/count
export const getDepartmentCount = async (req, res, next) => {
  try {
    const count = await Department.countDocuments();
    res.json({ count });
  } catch (error) {
    next(error);
  }
};
