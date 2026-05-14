import User from '../models/User.js';

/**
 * GET /api/users/me
 * Returns the MongoDB user record for the authenticated Firebase user.
 * The verifyFirebaseToken middleware must run first.
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.firebaseUser.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users/sync
 * Verifies the Firebase token and upserts the user in MongoDB.
 * Called on every app load when a user is already signed in.
 * Body: { displayName, birthday, photoURL, profileCompleted }
 */
export const syncUser = async (req, res, next) => {
  console.log('\n\nSYNC USER');
  try {
    const { uid, email } = req.firebaseUser;
    const { displayName, birthday, photoURL, profileCompleted } = req.body;
    console.log(uid, email, displayName);

    const setFields = { email };
    if (displayName !== undefined) setFields.displayName = displayName;
    if (birthday !== undefined) setFields.birthday = birthday;
    if (photoURL !== undefined) setFields.photoURL = photoURL;
    if (profileCompleted !== undefined)
      setFields.profileCompleted = profileCompleted;

    const user = await User.findOneAndUpdate(
      { uid },
      {
        $setOnInsert: { uid, createdAt: new Date() },
        $set: setFields,
      },
      { upsert: true, returnDocument: 'after' },
    );
    console.log('\nUser: ', user);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/me
 * Updates the current user's profile fields in MongoDB.
 * Body: { displayName?, birthday?, photoURL?, profileCompleted? }
 */
export const updateMe = async (req, res, next) => {
  try {
    const { uid } = req.firebaseUser;
    const { displayName, birthday, photoURL, profileCompleted } = req.body;

    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (birthday !== undefined) updates.birthday = birthday;
    if (photoURL !== undefined) updates.photoURL = photoURL;
    if (profileCompleted !== undefined)
      updates.profileCompleted = profileCompleted;

    const user = await User.findOneAndUpdate(
      { uid },
      { $set: updates },
      { returnDocument: 'after' },
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
