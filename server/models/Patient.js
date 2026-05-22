import mongoose from 'mongoose';
import Counter from './Counter.js';

const patientSchema = new mongoose.Schema(
  {
    patientId: {
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
    bloodGroup: { type: String, default: '' },
    height: { type: Number },
    weight: { type: Number },
    allergies: { type: String, default: '' },
    emergencyContactName: { type: String, default: '' },
    emergencyContactPhone: { type: String, default: '' },
    insuranceProvider: { type: String, default: '' },
    insuranceId: { type: String, default: '' },
    primaryDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  },
  { timestamps: true }
);

// Auto-generate patientId (P0001) on creation if not provided
patientSchema.pre('save', async function (next) {
  if (this.isNew && !this.patientId) {
    const seq = await Counter.getNextSequence('patient');
    this.patientId = `P${String(seq).padStart(4, '0')}`;
  }
  next();
});

// toJSON transform
patientSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
