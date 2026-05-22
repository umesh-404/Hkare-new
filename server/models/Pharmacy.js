import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Pharmacy name is required'] },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    latitude: { type: Number },
    longitude: { type: Number },
    operatingHours: { type: String, default: '' }
  },
  { timestamps: true }
);

// toJSON transform
pharmacySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
export default Pharmacy;
