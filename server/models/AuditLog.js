import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String, required: true }
  },
  { timestamps: false }
);

// Indexes for common queries
auditLogSchema.index({ username: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ action: 1 });

// toJSON transform: _id → id for frontend compatibility
auditLogSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
