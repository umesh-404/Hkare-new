import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    recordType: {
      type: String,
      enum: [
        'GENERAL_CHECKUP', 'EMERGENCY', 'FOLLOW_UP', 'SURGERY',
        'LAB_TEST', 'IMAGING', 'VACCINATION', 'CONSULTATION'
      ],
      default: 'GENERAL_CHECKUP'
    },
    diagnosis: { type: String, default: '' },
    symptoms: { type: String, default: '' },
    treatment: { type: String, default: '' },
    notes: { type: String, default: '' },
    prescription: { type: String, default: '' },
    testResults: { type: String, default: '' },
    medicalHistory: { type: String, default: '' },
    recordDate: { type: Date, default: Date.now },
    nextAppointment: { type: Date }
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patient: 1, recordDate: -1 });
medicalRecordSchema.index({ doctor: 1 });

// toJSON transform
medicalRecordSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
