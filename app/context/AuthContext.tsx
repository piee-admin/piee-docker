'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User, // 👈 Import the User type
  UserCredential, // 👈 Import for the signIn return type
} from 'firebase/auth';
import { auth } from '../firebase';

// 1. Define the shape of the context's value
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<UserCredential>;
  logOut: () => Promise<void>;
}

// 2. Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // 4. Type the state variables
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signIn = (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logOut = (): Promise<void> => {
    return signOut(auth);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      logOut,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 5. Create a custom hook for easy, type-safe access
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This error is helpful for development!
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}