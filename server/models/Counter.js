import mongoose from 'mongoose';

/**
 * Counter model for auto-increment ID generation.
 * Stores sequential counters for different entity types (doctor, patient, etc.)
 * to generate human-readable IDs like D0001, P0005, APT001.
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. 'doctor', 'patient', 'appointment'
  seq: { type: Number, default: 0 }
});

counterSchema.statics.getNextSequence = async function (name) {
  const counter = await this.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

const Counter = mongoose.model('Counter', counterSchema);
export default Counter;
