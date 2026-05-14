import Trip from '../models/Trip.js';

function generateShareCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const getMyTrips = async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    const trips = await Trip.find({ memberIds: uid }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    next(err);
  }
};

export const getTrip = async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (!trip.memberIds.includes(uid) && trip.userId !== uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    const { _id, userId, shareCode, memberIds, ...data } = req.body;
    const trip = await Trip.create({
      ...data,
      userId: uid,
      shareCode: generateShareCode(),
      memberIds: [uid],
    });
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
};

export const saveTrip = async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (!trip.memberIds.includes(uid) && trip.userId !== uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Strip fields that clients must not override
    const { _id, userId, shareCode, memberIds, createdAt, updatedAt, ...updates } = req.body;
    Object.assign(trip, updates);
    await trip.save();
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.userId !== uid) {
      return res.status(403).json({ error: 'Only the trip owner can delete it' });
    }
    await trip.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const lookupTripByCode = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const trip = await Trip.findOne({ shareCode: code });
    if (!trip) return res.status(404).json({ error: 'not_found' });
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

export const joinTrip = async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'not_found' });
    if (trip.memberIds.includes(uid)) {
      return res.status(409).json({ error: 'already_member' });
    }
    trip.memberIds.push(uid);
    trip.people = (trip.people ?? 1) + 1;
    await trip.save();
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

export const ensureShareCode = async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'trip_not_found' });
    if (!trip.memberIds.includes(uid) && trip.userId !== uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (trip.shareCode) return res.json({ shareCode: trip.shareCode });
    trip.shareCode = generateShareCode();
    await trip.save();
    res.json({ shareCode: trip.shareCode });
  } catch (err) {
    next(err);
  }
};