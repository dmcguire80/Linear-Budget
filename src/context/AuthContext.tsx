import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  type User,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (user) {
      await deleteUser(user);
    }
  }, [user]);

  const updateUserProfile = useCallback(
    async (displayName: string) => {
      if (user) {
        await updateProfile(user, { displayName });
        setUser({ ...user, displayName });
      }
    },
    [user]
  );

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    deleteAccount,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
