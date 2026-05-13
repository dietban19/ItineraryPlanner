import mongoose from 'mongoose';

const placeCacheSchema = new mongoose.Schema({
  placeId: { type: String, required: true, unique: true },
  name: { type: String, default: null },
  address: { type: String, default: null },
  rating: { type: Number, default: null },
  type: { type: String, default: 'activity' },
  imageUrl: { type: String, default: null },
  cachedAt: { type: Date, default: Date.now },
  details: { type: mongoose.Schema.Types.Mixed, default: null },
  detailsCachedAt: { type: Date, default: null },
});

export default mongoose.model('PlaceCache', placeCacheSchema);
