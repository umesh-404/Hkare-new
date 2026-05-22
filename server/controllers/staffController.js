import Staff from '../models/Staff.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

/**
 * Helper: Flatten a populated staff/admin document for the frontend.
 */
const flattenStaff = (doc) => {
  if (!doc) return doc;
  const obj = doc.toJSON ? doc.toJSON() : { ...doc };

  // Ensure a consistent displayId field
  obj.displayId = obj.staffId || obj.adminId || obj._id;

  if (obj.user) {
    obj.email = obj.user.email || '';
    obj.phoneNumber = obj.user.phoneNumber || '';
    obj.address = obj.user.address || '';
    obj.gender = obj.user.gender || '';
    obj.dateOfBirth = obj.user.dateOfBirth || null;
    obj.profilePictureUrl = obj.user.profilePictureUrl || '';
    obj.isActive = obj.user.isActive !== undefined ? obj.user.isActive : true;
    obj.userType = obj.user.userType || '';
    obj.userId = obj.user._id || obj.user.id;
  }

  if (obj.department && typeof obj.department === 'object') {
    obj.departmentName = obj.department.name || '';
  }

  return obj;
};

const flattenList = (list) => list.map(flattenStaff);

// @desc    Get all staff
// @route   GET /api/staff
export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await Staff.find()
      .populate('user', '-password')
      .populate('department');
    const admins = await Admin.find()
      .populate('user', '-password')
      .populate('department');

    // Combine and return all staff (including admins)
    const allStaff = [...staff, ...admins];
    res.json(flattenList(allStaff));
  } catch (error) {
    next(error);
  }
};

// @desc    Get staff by staffId
// @route   GET /api/staff/:id
export const getStaffById = async (req, res, next) => {
  try {
    let staffMember = await Staff.findOne({ staffId: req.params.id })
      .populate('user', '-password')
      .populate('department');

    if (!staffMember) {
      staffMember = await Admin.findOne({ adminId: req.params.id })
        .populate('user', '-password')
        .populate('department');
    }

    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json(flattenStaff(staffMember));
  } catch (error) {
    next(error);
  }
};

// @desc    Get staff by user ID
// @route   GET /api/staff/user/:userId
export const getStaffByUserId = async (req, res, next) => {
  try {
    let staffMember = await Staff.findOne({ user: req.params.userId })
      .populate('user', '-password')
      .populate('department');

    if (!staffMember) {
      staffMember = await Admin.findOne({ user: req.params.userId })
        .populate('user', '-password')
        .populate('department');
    }

    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json(flattenStaff(staffMember));
  } catch (error) {
    next(error);
  }
};

// @desc    Get staff by department
// @route   GET /api/staff/department/:departmentId
export const getStaffByDepartment = async (req, res, next) => {
  try {
    const staff = await Staff.find({ department: req.params.departmentId })
      .populate('user', '-password')
      .populate('department');
    res.json(flattenList(staff));
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
export const updateStaff = async (req, res, next) => {
  try {
    let staffMember = await Staff.findOne({ staffId: req.params.id });
    let isAdminRecord = false;

    if (!staffMember) {
      staffMember = await Admin.findOne({ adminId: req.params.id });
      isAdminRecord = true;
    }

    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const allowedFields = ['firstName', 'lastName', 'position', 'hireDate', 'department'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        staffMember[field] = req.body[field];
      }
    });

    if (req.body.phoneNumber || req.body.address || req.body.gender || req.body.dateOfBirth || req.body.profilePictureUrl) {
      const user = await User.findById(staffMember.user);
      if (user) {
        if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;
        if (req.body.address) user.address = req.body.address;
        if (req.body.gender) user.gender = req.body.gender;
        if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
        if (req.body.profilePictureUrl) user.profilePictureUrl = req.body.profilePictureUrl;
        await user.save();
      }
    }

    await staffMember.save();

    const Model = isAdminRecord ? Admin : Staff;
    const idField = isAdminRecord ? 'adminId' : 'staffId';
    const updated = await Model.findOne({ [idField]: req.params.id })
      .populate('user', '-password')
      .populate('department');

    res.json(flattenStaff(updated));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
export const deleteStaff = async (req, res, next) => {
  try {
    let staffMember = await Staff.findOne({ staffId: req.params.id });

    if (!staffMember) {
      staffMember = await Admin.findOne({ adminId: req.params.id });
      if (staffMember) {
        await User.findByIdAndUpdate(staffMember.user, { isActive: false });
        await Admin.deleteOne({ adminId: req.params.id });
        return res.json({ success: true, message: 'Admin deleted successfully' });
      }
    } else {
      await User.findByIdAndUpdate(staffMember.user, { isActive: false });
      await Staff.deleteOne({ staffId: req.params.id });
      return res.json({ success: true, message: 'Staff deleted successfully' });
    }

    return res.status(404).json({ success: false, message: 'Staff member not found' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get staff count
// @route   GET /api/staff/count
export const getStaffCount = async (req, res, next) => {
  try {
    const staffCount = await Staff.countDocuments();
    const adminCount = await Admin.countDocuments();
    res.json({ count: staffCount + adminCount, staffCount, adminCount });
  } catch (error) {
    next(error);
  }
};
