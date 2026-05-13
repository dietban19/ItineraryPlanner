import mongoose from 'mongoose';

const apiLogSchema = new mongoose.Schema({
  apiName: { type: String, required: true, unique: true },
  calls: [{ calledAt: { type: Date, default: Date.now } }],
});

export default mongoose.model('ApiLog', apiLogSchema);
