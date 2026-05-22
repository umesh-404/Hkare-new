import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'] },
    message: { type: String, required: [true, 'Message is required'] },
    recipientType: {
      type: String,
      enum: ['PATIENT', 'DOCTOR', 'ADMIN', 'STAFF'],
      required: true
    },
    recipientId: { type: String, required: true },
    senderUsername: { type: String, default: '' },
    priority: { type: String, default: 'NORMAL' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date }
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientType: 1 });

// toJSON transform
notificationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
