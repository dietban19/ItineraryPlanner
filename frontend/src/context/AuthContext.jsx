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
  getUserProfile,
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
        const profile = await getUserProfile(firebaseUser.uid);
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
   * Called from CompleteProfilePage after registration to create the Firestore user doc.
   * @param {{ displayName: string, birthday: string, photoFile: File|null }} profileData
   */
  const completeProfile = async ({ displayName, birthday, photoFile }) => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    const created = await createUserProfile(auth.currentUser.uid, {
      displayName,
      birthday,
      photoFile: photoFile ?? null,
      email: auth.currentUser.email,
    });
    setUserProfile({
      id: auth.currentUser.uid,
      ...created,
      profileCompleted: true,
    });
  };

  const updateProfile = async (updates) => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    await updateUserProfile(auth.currentUser.uid, updates);
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : prev));
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
