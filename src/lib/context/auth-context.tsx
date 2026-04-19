"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  googleProvider,
  deleteUser,
  type User,
  db,
} from "@/lib/firebase";
import { UserCredential } from "firebase/auth";
import { UserProfile } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";

// Describes what values and functions the auth context will expose to the app
// Object type
// User info and methods
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  getUserProfile: () => Promise<void>;
}
// Creates the context. user info
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Stores auth state and exposes it to children/page
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetches user profile from Firestore
  async function getUserProfile() {
    if (user) {
      const profileDoc = await getDoc(doc(db, COLLECTIONS.users, user.uid));
      setUserProfile({
        id: profileDoc.id,
        ...profileDoc.data(),
      } as UserProfile);
    }
  }

  // Listens for Firebase Auth session changes. lets the user stay logged in after refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      getUserProfile();
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const deleteAccount = async () => {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  };

  // defines the state which this context provide
  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        deleteAccount,
        getUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Reads the context and returns context values
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
