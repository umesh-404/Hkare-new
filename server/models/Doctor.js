import mongoose from 'mongoose';
import Counter from './Counter.js';

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
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
    specialization: { type: String, default: '' },
    qualification: { type: String, default: '' },
    experienceYears: { type: Number, default: 0 },
    licenseNumber: { type: String, default: '' },
    consultationFee: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    }
  },
  { timestamps: true }
);

// Auto-generate doctorId (D0001) on creation if not provided
doctorSchema.pre('save', async function (next) {
  if (this.isNew && !this.doctorId) {
    const seq = await Counter.getNextSequence('doctor');
    this.doctorId = `D${String(seq).padStart(4, '0')}`;
  }
  next();
});

// toJSON transform
doctorSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
