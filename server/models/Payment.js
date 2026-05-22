import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    amount: { type: Number, required: [true, 'Amount is required'] },
    type: {
      type: String,
      enum: ['CONSULTATION', 'PROCEDURE', 'MEDICATION', 'LABORATORY', 'IMAGING', 'OTHER'],
      default: 'CONSULTATION'
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'],
      default: 'PENDING'
    },
    transactionId: { type: String, default: '' },
    paymentMethod: { type: String, default: '' },
    notes: { type: String, default: '' },
    paymentDate: { type: Date, default: Date.now },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  },
  { timestamps: true }
);

paymentSchema.index({ patient: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });

// toJSON transform
paymentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
