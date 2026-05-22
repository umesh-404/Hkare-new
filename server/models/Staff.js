import mongoose from 'mongoose';
import Counter from './Counter.js';

const staffSchema = new mongoose.Schema(
  {
    staffId: {
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

staffSchema.methods.isAdmin = function () {
  return this.staffId && this.staffId.startsWith('A');
};

// Auto-generate staffId (S0001) on creation if not provided
staffSchema.pre('save', async function (next) {
  if (this.isNew && !this.staffId) {
    const seq = await Counter.getNextSequence('staff');
    this.staffId = `S${String(seq).padStart(4, '0')}`;
  }
  next();
});

// toJSON transform
staffSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
