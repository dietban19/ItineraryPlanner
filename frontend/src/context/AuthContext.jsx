import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  registerWithEmail,
  loginWithEmail,
  logoutUser,
} from '../services/auth.service';
import {
  createUserProfile,
  syncUserProfile,
  updateUserProfile,
} from '../services/user.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = still resolving, null = not logged in, object = logged in
  const [user, setUser] = useState(undefined);
  // undefined = still loading, null = no profile yet, object = profile exists
  const [userProfile, setUserProfile] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Get a fresh ID token — this validates the session with Firebase
        const idToken = await firebaseUser.getIdToken();
        // Sync with MongoDB: upserts the user if not present, returns the record
        const profile = await syncUserProfile(idToken);
        console.log('GOT PROFILE: ', profile);
        setUserProfile(profile ?? null);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => loginWithEmail(email, password);

  const register = (email, password) => registerWithEmail(email, password);

  /**
   * Called from CompleteProfilePage after registration to create the MongoDB user doc.
   * @param {{ displayName: string, birthday: string }} profileData
   */
  const completeProfile = async ({ displayName, birthday }) => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    const idToken = await auth.currentUser.getIdToken();
    const created = await createUserProfile(idToken, { displayName, birthday });
    setUserProfile(created);
  };

  const updateProfile = async (updates) => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    const idToken = await auth.currentUser.getIdToken();
    const updated = await updateUserProfile(idToken, updates);
    setUserProfile(updated);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setUserProfile(null);
  };

  const loading = user === undefined || userProfile === undefined;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        completeProfile,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
