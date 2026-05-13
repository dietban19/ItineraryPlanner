import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { addMemberToTripChat } from './chat.service';

const tripsCollection = () => collection(db, 'trips');

/**
 * Subscribes to real-time updates for all trips belonging to a user.
 * Trips are ordered by creation date, newest first.
 *
 * @param {string} userId - Firebase Auth UID
 * @param {function} callback - Called with an array of plain trip objects whenever data changes
 * @returns {function} Unsubscribe function — call it to stop listening
 */
export const subscribeToUserTrips = (userId, callback) => {
  // Query by memberIds so both owned and joined trips are returned.
  // Old trips created before memberIds existed are caught by the fallback
  // userId query below and backfilled on the fly.
  const byMember = query(
    tripsCollection(),
    where('memberIds', 'array-contains', userId),
  );
  const byOwner = query(tripsCollection(), where('userId', '==', userId));

  let memberSnap = [];
  let ownerSnap = [];

  function merge() {
    const seen = new Set();
    const all = [];
    for (const d of [...memberSnap, ...ownerSnap]) {
      if (!seen.has(d._id)) {
        seen.add(d._id);
        all.push(d);
      }
    }
    all.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    callback(all);
  }

  function toPlain(d) {
    return {
      _id: d.id,
      ...d.data(),
      createdAt:
        d.data().createdAt?.toDate?.().toISOString() ?? d.data().createdAt,
      updatedAt:
        d.data().updatedAt?.toDate?.().toISOString() ?? d.data().updatedAt,
    };
  }

  const unsubMember = onSnapshot(byMember, (snapshot) => {
    memberSnap = snapshot.docs.map(toPlain);
    merge();
  });

  const unsubOwner = onSnapshot(byOwner, (snapshot) => {
    // Backfill memberIds for old trips that are missing it
    snapshot.docs.forEach((d) => {
      const data = d.data();
      if (!data.memberIds || !data.memberIds.includes(userId)) {
        updateDoc(d.ref, {
          memberIds: arrayUnion(userId),
        }).catch(console.error);
      }
    });
    ownerSnap = snapshot.docs.map(toPlain);
    merge();
  });

  return () => {
    unsubMember();
    unsubOwner();
  };
};

/**
 * Creates a new trip document in Firestore.
 *
 * @param {string} userId
 * @param {object} tripData - Plain trip object (from Trip.toJSON(), minus _id)
 * @returns {Promise<string>} The new Firestore document ID
 */
/**
 * Generates a random 8-character alphanumeric share code.
 * Collision probability is negligible for typical usage volumes.
 */
function generateShareCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
  let code = '';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  for (const byte of array) {
    code += chars[byte % chars.length];
  }
  return code;
}

export const createTrip = async (userId, tripData) => {
  const { _id, ...rest } = tripData;
  const shareCode = generateShareCode();

  // Use a batch to create the trip and update the user's tripIds atomically
  const batch = writeBatch(db);

  const tripRef = doc(tripsCollection());
  batch.set(tripRef, {
    ...rest,
    userId,
    shareCode,
    // memberIds tracks everyone who has joined (including the owner)
    memberIds: [userId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const userRef = doc(db, 'users', userId);
  batch.update(userRef, { tripIds: arrayUnion(tripRef.id) });

  await batch.commit();
  return tripRef.id;
};

/**
 * Persists a full trip update to Firestore.
 * Pass the serialised plain object (Trip.toJSON()) as the update payload.
 *
 * @param {string} tripId - Firestore document ID
 * @param {object} tripData - Full or partial plain trip object
 */
export const saveTrip = async (tripId, tripData) => {
  const { _id, ...rest } = tripData;
  await updateDoc(doc(db, 'trips', tripId), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Deletes a trip document from Firestore.
 *
 * @param {string} tripId
 */
/**
 * Looks up a trip by its share code.
 * Returns the plain trip object or null if not found.
 *
 * @param {string} code - The 8-char share code
 * @returns {Promise<object|null>}
 */
export const lookupTripByCode = async (code) => {
  const q = query(
    tripsCollection(),
    where('shareCode', '==', code.toUpperCase().trim()),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { _id: d.id, ...d.data() };
};

/**
 * Joins a trip by code for a given user.
 * - Increments people count on the trip
 * - Adds userId to trip.memberIds
 * - Adds tripId to user.tripIds
 *
 * @param {string} code
 * @param {string} userId
 * @returns {Promise<object>} The trip plain object
 * @throws {Error} 'not_found' | 'already_member'
 */
export const joinTripByCode = async (code, userId) => {
  const trip = await lookupTripByCode(code);
  if (!trip) throw new Error('not_found');

  const memberIds = trip.memberIds ?? [];
  if (memberIds.includes(userId)) throw new Error('already_member');

  const batch = writeBatch(db);

  const tripRef = doc(db, 'trips', trip._id);
  batch.update(tripRef, {
    memberIds: arrayUnion(userId),
    people: increment(1),
    updatedAt: serverTimestamp(),
  });

  const userRef = doc(db, 'users', userId);
  batch.update(userRef, { tripIds: arrayUnion(trip._id) });

  await batch.commit();

  // Add the new member to the trip's chat room if one already exists.
  // Uses a best-effort fire-and-forget — non-critical path.
  addMemberToTripChat(trip._id, userId).catch(console.error);

  return trip._id;
};

/**
 * Ensures a trip has a share code, generating and persisting one if it doesn't.
 * Safe to call multiple times — reads before writing.
 *
 * @param {string} tripId
 * @returns {Promise<string>} The share code
 */
export const ensureShareCode = async (tripId) => {
  console.log('ENSURE');
  const tripRef = doc(db, 'trips', tripId);
  const snap = await getDoc(tripRef);
  console.log('SNAP', snap.exists());
  if (!snap.exists()) throw new Error('trip_not_found');
  const existing = snap.data().shareCode;
  console.log('EXISTING: ', existing);
  if (existing) return existing;
  const code = generateShareCode();
  console.log('CODE: ', code);
  await updateDoc(tripRef, { shareCode: code, updatedAt: serverTimestamp() });
  return code;
};

export const deleteTrip = async (tripId, userId) => {
  const batch = writeBatch(db);

  batch.delete(doc(db, 'trips', tripId));

  if (userId) {
    batch.update(doc(db, 'users', userId), { tripIds: arrayRemove(tripId) });
  }

  await batch.commit();
};
