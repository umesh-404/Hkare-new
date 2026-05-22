import mongoose from 'mongoose';
import Counter from './Counter.js';

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      sparse: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    appointmentDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      default: 'SCHEDULED'
    },
    reason: { type: String, default: '' },
    notes: { type: String, default: '' },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    appointmentFee: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Indexes for common queries
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

// Auto-generate appointmentId (APT0001) on creation
appointmentSchema.pre('save', async function (next) {
  if (this.isNew && !this.appointmentId) {
    const seq = await Counter.getNextSequence('appointment');
    this.appointmentId = `APT${String(seq).padStart(4, '0')}`;
  }
  next();
});

// toJSON transform: include virtuals and map _id → id
appointmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
