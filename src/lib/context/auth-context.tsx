"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  deleteUser,
  type User,
  UserCredential,
} from "firebase/auth";
import { UserProfile } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { auth, db, googleProvider } from "../firebase";

// Describes what values and functions the auth context will expose to the app
// Object type
// User info and methods
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  getUserProfile: () => Promise<void>;
}
// Creates the context. user info
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Stores auth state and exposes it to children/page
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetches user profile from Firestore
  async function getUserProfile(user: User) {
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await getUserProfile(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    return await signOut(auth);
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
        getUserProfile: async () => await getUserProfile(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Reads the context and returns context values
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
