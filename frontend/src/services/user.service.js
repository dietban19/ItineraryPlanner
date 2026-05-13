import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

/**
 * Creates a user profile document in Firestore after registration.
 * Optionally uploads a profile photo to Firebase Storage.
 *
 * @param {string} uid - Firebase Auth UID
 * @param {{ displayName: string, birthday: string, photoFile: File|null, email: string }} profileData
 * @returns {Promise<object>} The created profile data
 */
export const createUserProfile = async (
  uid,
  { displayName, birthday, photoFile, email },
) => {
  let photoURL = '';

  if (photoFile) {
    const storageRef = ref(storage, `avatars/${uid}`);
    await uploadBytes(storageRef, photoFile);
    photoURL = await getDownloadURL(storageRef);
  }

  const profileDoc = {
    displayName,
    birthday,
    photoURL,
    email,
    profileCompleted: true,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', uid), profileDoc);
  return profileDoc;
};

/**
 * Fetches a user profile document from Firestore.
 *
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Updates fields on an existing user profile document.
 *
 * @param {string} uid
 * @param {object} updates
 */
export const updateUserProfile = async (uid, updates) => {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};
