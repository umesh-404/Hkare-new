import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Department name is required'] },
    description: { type: String, default: '' },
    headDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  },
  { timestamps: true }
);

// toJSON transform
departmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
