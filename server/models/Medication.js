import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Medication name is required'] },
    genericName: { type: String, default: '' },
    brand: { type: String, default: '' },
    manufacturer: { type: String, default: '' },
    type: {
      type: String,
      enum: [
        'ANTIBIOTIC', 'ANALGESIC', 'ANTI_INFLAMMATORY', 'ANTIHISTAMINE',
        'ANTIDEPRESSANT', 'ANTIHYPERTENSIVE', 'ANTIDIABETIC', 'DIURETIC',
        'STEROID', 'VACCINE', 'VITAMIN', 'ANTICONVULSANT', 'ANTIPSYCHOTIC',
        'ANTICOAGULANT', 'BRONCHODILATOR', 'SEDATIVE', 'LAXATIVE', 'ANTACID',
        'ANTIVIRAL', 'ANTIFUNGAL', 'OTHER'
      ],
      default: 'OTHER'
    },
    description: { type: String, default: '' },
    dosageForm: { type: String, default: '' },
    strength: { type: String, default: '' },
    dosageUnit: {
      type: String,
      enum: ['MG', 'ML', 'G', 'MCG', 'PERCENT', 'IU', 'MEQ', 'UNIT', 'OTHER'],
      default: 'MG'
    },
    sideEffects: { type: String, default: '' },
    contraindications: { type: String, default: '' },
    storage: { type: String, default: '' },
    requiresPrescription: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 0 },
    batchNumber: { type: String, default: '' },
    manufactureDate: { type: Date },
    expiryDate: { type: Date },
    barcode: { type: String, default: '' },
    NDCCode: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

medicationSchema.index({ name: 'text', genericName: 'text' });
medicationSchema.index({ isActive: 1 });

// toJSON transform
medicationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Medication = mongoose.model('Medication', medicationSchema);
export default Medication;
