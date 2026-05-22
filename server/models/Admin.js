import mongoose from 'mongoose';
import Counter from './Counter.js';

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    position: { type: String, default: '' },
    hireDate: { type: Date }
  },
  { timestamps: true }
);

// Auto-generate adminId (A0001) on creation if not provided
adminSchema.pre('save', async function (next) {
  if (this.isNew && !this.adminId) {
    const seq = await Counter.getNextSequence('admin');
    this.adminId = `A${String(seq).padStart(4, '0')}`;
  }
  next();
});

// toJSON transform
adminSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
