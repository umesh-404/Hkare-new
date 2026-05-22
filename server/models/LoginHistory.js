import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    loginTime: { type: Date, default: Date.now },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    loginSuccess: { type: Boolean, required: true },
    failureReason: { type: String, default: '' }
  },
  { timestamps: false }
);

loginHistorySchema.index({ username: 1 });
loginHistorySchema.index({ loginTime: -1 });

// toJSON transform: _id → id for frontend compatibility
loginHistorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
export default LoginHistory;
