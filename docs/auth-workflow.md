# Authentication Workflow

This app uses **Firebase Auth** as the identity provider and **MongoDB** as the source of truth for user profile data. Firebase handles login/session management; MongoDB stores the actual user record.

---

## On Every Page Load / Refresh

```
Browser                     Frontend (AuthContext)              Backend                  Firebase / MongoDB
  |                                  |                               |                         |
  |-- page loads -----------------> |                               |                         |
  |                        onAuthStateChanged fires                 |                         |
  |                                  |--- checks Firebase session -->|                         |
  |                                  |                               |--- verifyIdToken() --> Firebase
  |                                  |                               |<-- ✅ valid session ---|
  |                                  |                               |                         |
  |                                  |<-- firebaseUser returned -----|                         |
  |                                  |                               |                         |
  |                        getIdToken() called                       |                         |
  |                        (gets fresh signed JWT)                   |                         |
  |                                  |                               |                         |
  |                                  |--- POST /api/users/sync ----> |                         |
  |                                  |    Authorization: Bearer <token>                        |
  |                                  |                               |--- verifyIdToken() --> Firebase
  |                                  |                               |<-- ✅ decoded uid -----|
  |                                  |                               |                         |
  |                                  |                               |--- findOneAndUpdate() -> MongoDB
  |                                  |                               |    (upsert: true)        |
  |                                  |                               |<-- user document --------|
  |                                  |<-- user profile (JSON) -------|                         |
  |                                  |                               |                         |
  |                        setUserProfile(profile)                   |                         |
  |<-- app renders with user --------|                               |                         |
```

---

## Step-by-Step Explanation

### 1. Firebase checks if the session is still valid

When the app loads, `onAuthStateChanged` in `AuthContext.jsx` fires automatically. Firebase checks its local session (stored in `IndexedDB`/`localStorage`). If a session exists and is still valid, it returns a `firebaseUser` object. If the session has expired or the user logged out, it returns `null`.

```js
// AuthContext.jsx
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    // user is authenticated in Firebase
  } else {
    // user is not logged in
  }
});
```

### 2. A fresh ID token is requested

Firebase ID tokens expire after 1 hour. `getIdToken()` is called to get a fresh, signed JWT. Firebase handles the refresh silently if the token has expired.

```js
const idToken = await firebaseUser.getIdToken();
```

This token contains the user's `uid` and `email`, cryptographically signed by Firebase. It is short-lived and cannot be forged.

### 3. Frontend calls `POST /api/users/sync`

The ID token is sent to the backend in the `Authorization` header. This endpoint both validates authentication and syncs the user with MongoDB.

```js
// user.service.js
await fetch(`${API_URL}/users/sync`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${idToken}` },
  body: JSON.stringify(profileData),
});
```

### 4. Backend verifies the token with Firebase Admin SDK

The `verifyFirebaseToken` middleware calls Firebase Admin's `verifyIdToken()`. This cryptographically validates the JWT — no database call to Firebase is needed at this step (it verifies the signature locally using Firebase's public keys).

```js
// verifyFirebaseToken.js
const decoded = await admin.auth().verifyIdToken(idToken);
req.firebaseUser = decoded; // { uid, email, ... }
```

If the token is invalid, expired, or tampered with, the middleware returns `401` immediately.

### 5. Backend upserts the user in MongoDB

The `syncUser` controller runs a `findOneAndUpdate` with `upsert: true`. This means:

- **If the user exists in MongoDB** → the record is returned as-is (only `email` is refreshed)
- **If the user does NOT exist in MongoDB** → a new document is created with the `uid` and `email` from the verified Firebase token

```js
// user.controller.js
const user = await User.findOneAndUpdate(
  { uid }, // find by Firebase UID
  {
    $setOnInsert: { uid, email }, // only set these on first creation
    $set: { email, ...profileFields }, // always keep email fresh
  },
  { upsert: true, new: true }, // create if not found, return new doc
);
```

### 6. Profile is set in React state

The MongoDB user document is returned to the frontend and stored in `AuthContext` as `userProfile`. The app is now fully loaded with both Firebase auth state and MongoDB profile data.

---

## Registration Flow

When a new user registers, the flow is slightly different:

1. Firebase creates the account via `createUserWithEmailAndPassword`
2. User fills in their display name and birthday on the Complete Profile page
3. `createUserProfile()` is called → sends `POST /api/users/sync` with `profileCompleted: true`
4. The backend upserts the document with the full profile data

---

## Summary

| What is checked                          | Where                        | Purpose                          |
| ---------------------------------------- | ---------------------------- | -------------------------------- |
| Is the Firebase session still valid?     | Firebase SDK (client-side)   | Restores user session on refresh |
| Is the ID token cryptographically valid? | Firebase Admin SDK (backend) | Prevents forged/expired tokens   |
| Does the user exist in MongoDB?          | MongoDB `findOneAndUpdate`   | Auto-creates record if missing   |

The key guarantee is: **a user can never appear in MongoDB without a valid Firebase account**, because the `uid` written to MongoDB always comes from a token verified by Firebase Admin.
