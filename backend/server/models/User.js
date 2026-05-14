import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true }, // Firebase Auth UID
    email: { type: String, required: true },
    displayName: { type: String, default: '' },
    birthday: { type: String, default: null },
    photoURL: { type: String, default: '' },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
