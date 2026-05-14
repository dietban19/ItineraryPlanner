import admin from '../config/firebaseAdmin.js';

/**
 * Middleware that verifies the Firebase ID token sent in the Authorization header.
 * Attaches the decoded token to req.firebaseUser on success.
 */
export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired Firebase token' });
  }
};
