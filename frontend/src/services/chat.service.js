import {
  collection,
  doc,
  addDoc,
  setDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  orderBy,
  limit,
  getDocs,
  getDoc,
  arrayUnion,
  deleteField,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const chatsCol = () => collection(db, 'chats');
const messagesCol = (chatId) => collection(db, 'chats', chatId, 'messages');

// ─── DM Chats ─────────────────────────────────────────────────────────────────

/**
 * Finds an existing DM chat between two users, or creates one if it doesn't exist.
 * Uses array-contains query + client-side filter to avoid needing a composite index.
 *
 * @param {string} currentUserId
 * @param {string} otherUserId
 * @returns {Promise<string>} The chatId
 */
export const getOrCreateDMChat = async (currentUserId, otherUserId) => {
  const q = query(
    chatsCol(),
    where('type', '==', 'dm'),
    where('memberIds', 'array-contains', currentUserId),
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) =>
    d.data().memberIds.includes(otherUserId),
  );

  if (existing) return existing.id;

  // Create new DM chat
  const ref = doc(chatsCol());
  await setDoc(ref, {
    type: 'dm',
    memberIds: [currentUserId, otherUserId],
    tripId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: null,
    typing: {},
  });
  return ref.id;
};

// ─── Trip Chats ───────────────────────────────────────────────────────────────

/**
 * Gets the chat for a trip, lazily creating it if it doesn't exist yet.
 * Also ensures the given userId is a member (handles users who joined later).
 *
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<string>} The chatId
 */
export const getOrCreateTripChat = async (tripId, userId) => {
  const q = query(chatsCol(), where('tripId', '==', tripId));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const existing = snap.docs[0];
    if (!existing.data().memberIds.includes(userId)) {
      await updateDoc(existing.ref, { memberIds: arrayUnion(userId) });
    }
    return existing.id;
  }

  // Create a new trip chat
  const ref = doc(chatsCol());
  await setDoc(ref, {
    type: 'trip',
    tripId,
    memberIds: [userId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: null,
    typing: {},
  });
  return ref.id;
};

/**
 * Adds a user to an existing trip chat when they join the trip.
 * Safe to call even if the chat doesn't exist yet (no-op in that case).
 *
 * @param {string} tripId
 * @param {string} userId
 */
export const addMemberToTripChat = async (tripId, userId) => {
  const q = query(chatsCol(), where('tripId', '==', tripId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    await updateDoc(snap.docs[0].ref, { memberIds: arrayUnion(userId) });
  }
};

// ─── Subscriptions ────────────────────────────────────────────────────────────

/**
 * Subscribes to all chats the current user is a member of.
 * Returns plain objects with Timestamps converted to ISO strings.
 *
 * @param {string} userId
 * @param {function} callback
 * @returns {function} Unsubscribe
 */
export const subscribeToUserChats = (userId, callback) => {
  const q = query(chatsCol(), where('memberIds', 'array-contains', userId));
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.().toISOString() ?? data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() ?? data.updatedAt,
        lastMessage: data.lastMessage
          ? {
              ...data.lastMessage,
              timestamp:
                data.lastMessage.timestamp?.toDate?.().toISOString() ??
                data.lastMessage.timestamp,
            }
          : null,
      };
    });
    callback(chats);
  });
};

/**
 * Subscribes to messages in a chat, ordered oldest → newest.
 * Limited to the last 200 messages.
 *
 * @param {string} chatId
 * @param {function} callback
 * @returns {function} Unsubscribe
 */
export const subscribeToMessages = (chatId, callback) => {
  const q = query(messagesCol(chatId), orderBy('createdAt', 'asc'), limit(200));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.().toISOString() ?? null,
    }));
    callback(messages);
  });
};

/**
 * Subscribes to a single chat document for typing indicators and metadata updates.
 * Converts typing.*.lastTyping from Firestore Timestamp to JS Date for easy comparison.
 *
 * @param {string} chatId
 * @param {function} callback
 * @returns {function} Unsubscribe
 */
export const subscribeToChat = (chatId, callback) => {
  return onSnapshot(doc(db, 'chats', chatId), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    // Normalise typing timestamps to JS Dates
    const typing = {};
    if (data.typing) {
      for (const [uid, val] of Object.entries(data.typing)) {
        typing[uid] = {
          ...val,
          lastTyping: val.lastTyping?.toDate?.() ?? new Date(),
        };
      }
    }
    callback({ id: snap.id, ...data, typing });
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Sends a message to a chat and updates the chat's lastMessage preview field.
 *
 * @param {string} chatId
 * @param {{ senderId: string, senderName: string, senderPhotoURL: string, text: string }} params
 */
export const sendMessage = async (
  chatId,
  { senderId, senderName, senderPhotoURL, text },
) => {
  const trimmed = text.trim();
  if (!trimmed) return;

  await addDoc(messagesCol(chatId), {
    senderId,
    senderName,
    senderPhotoURL: senderPhotoURL ?? '',
    text: trimmed,
    createdAt: serverTimestamp(),
    readBy: [senderId],
  });

  // Update the lastMessage preview on the parent chat doc
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: {
      text: trimmed,
      senderId,
      senderName,
      senderPhotoURL: senderPhotoURL ?? '',
      timestamp: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });
};

/**
 * Sets or clears a user's typing indicator on a chat document.
 * Errors are silently ignored — typing indicators are non-critical.
 *
 * @param {string} chatId
 * @param {string} userId
 * @param {{ displayName: string, photoURL: string }} userData
 * @param {boolean} isTyping
 */
export const setTyping = async (chatId, userId, userData, isTyping) => {
  try {
    if (isTyping) {
      await updateDoc(doc(db, 'chats', chatId), {
        [`typing.${userId}`]: {
          displayName: userData.displayName ?? '',
          photoURL: userData.photoURL ?? '',
          lastTyping: serverTimestamp(),
        },
      });
    } else {
      await updateDoc(doc(db, 'chats', chatId), {
        [`typing.${userId}`]: deleteField(),
      });
    }
  } catch {
    // Non-critical — swallow silently
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetches a single user profile document from Firestore.
 *
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export const fetchUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
