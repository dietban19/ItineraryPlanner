import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, default: null },
    userName: { type: String, default: 'Anonymous' },
    photos: [String],
    rating: { type: Number, default: 0 },
    comment: { type: String, default: '' },
    addedAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false },
);

const activitySchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    time: { type: String, default: '' },
    image: { type: String, default: '' },
    rating: { type: Number, default: null },
    placeId: { type: String, default: null },
    type: {
      type: String,
      enum: ['activity', 'restaurant', 'custom'],
      default: 'activity',
    },
    status: {
      type: String,
      enum: ['planned', 'done', 'skipped'],
      default: 'planned',
    },
    reviews: [reviewSchema],
  },
  { _id: false },
);

const daySchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    dayNum: { type: Number, required: true },
    dayName: { type: String, default: '' },
    date: { type: String, default: '' },
    title: { type: String, default: '' },
    activities: [activitySchema],
  },
  { _id: false },
);

const tripSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    dateRange: {
      start: { type: String, default: null },
      end: { type: String, default: null },
      label: { type: String, default: '' },
    },
    people: { type: Number, default: 1 },
    image: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    budget: {
      total: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    days: [daySchema],
    status: {
      type: String,
      enum: ['planning', 'ongoing', 'completed'],
      default: 'planning',
    },
    shareCode: { type: String, default: null },
    memberIds: [String],
  },
  { timestamps: true },
);

tripSchema.index({ memberIds: 1 });
tripSchema.index({ userId: 1 });
tripSchema.index({ shareCode: 1 }, { unique: true, sparse: true });

export default mongoose.model('Trip', tripSchema);