const API_URL = import.meta.env.VITE_API_URL;

/**
 * Creates a user profile in MongoDB after registration.
 *
 * @param {string} idToken - Firebase ID token for auth
 * @param {{ displayName: string, birthday: string }} profileData
 * @returns {Promise<object>} The created profile data
 */
export const createUserProfile = async (idToken, { displayName, birthday }) => {
  const res = await fetch(`${API_URL}/users/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      displayName,
      birthday,
      profileCompleted: true,
    }),
  });

  if (!res.ok) throw new Error('Failed to create user profile');
  return res.json();
};

/**
 * Syncs the Firebase user into MongoDB (upsert). Called on every auth state load.
 *
 * @param {string} idToken - Firebase ID token
 * @param {object} [profileData] - Optional profile fields to set
 * @returns {Promise<object|null>}
 */
export const syncUserProfile = async (idToken, profileData = {}) => {
  console.log('\n\nSYNC USER PROFILE: ', idToken, profileData);
  const res = await fetch(`${API_URL}/users/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) return null;
  return res.json();
};

/**
 * Fetches the current user's profile from MongoDB.
 *
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<object|null>}
 */
export const getUserProfile = async (idToken) => {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
};

/**
 * Updates fields on the current user's profile in MongoDB.
 *
 * @param {string} idToken - Firebase ID token
 * @param {object} updates
 * @returns {Promise<object>}
 */
export const updateUserProfile = async (idToken, updates) => {
  const res = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error('Failed to update user profile');
  return res.json();
};
