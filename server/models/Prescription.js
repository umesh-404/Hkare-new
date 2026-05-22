import mongoose from 'mongoose';

const prescriptionMedicationSchema = new mongoose.Schema(
  {
    medicationName: { type: String, required: true },
    dosage: { type: String, default: '' },
    frequency: { type: String, default: '' },
    instructions: { type: String, default: '' },
    quantity: { type: Number, default: 0 },
    duration: { type: String, default: '' }
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
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
    medicalRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord'
    },
    prescriptionDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE'
    },
    notes: { type: String, default: '' },
    isRefillable: { type: Boolean, default: false },
    refillsRemaining: { type: Number, default: 0 },
    totalRefills: { type: Number, default: 0 },
    medications: [prescriptionMedicationSchema],
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy'
    }
  },
  { timestamps: true }
);

prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });
prescriptionSchema.index({ status: 1 });

// toJSON transform
prescriptionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
