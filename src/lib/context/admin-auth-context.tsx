"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { AdminRole } from "../types";
import { routes } from "../routes";

interface AdminUser extends User {
  role?: AdminRole;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  role: AdminRole | null;
  login: (email: string, password: string) => Promise<AdminUser | null>;
  logout: () => Promise<void>;
  sendResetEmail: (email: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

const rolePermissions: Record<AdminRole, string[]> = {
  "super-admin": [
    "manage_questions",
    "manage_tips",
    "manage_users",
    "manage_feedback",
    "manage_forum",
    "manage_billing",
    "manage_admins",
    "view_analytics",
  ],
  "content-manager": ["manage_questions", "manage_tips", "view_analytics"],
  moderator: ["manage_forum", "manage_users", "view_analytics"],
};

async function isAdmin(email: string) {
  try {
    const res = await fetch(routes.api.isAdmin({ email }), {
      headers: { "Content-type": "application/json" },
    });

    if (res.ok) {
      const isAdminData = await res.json();
      return ["ok", isAdminData];
    }
    return ["error", new Error("Request failed")];
  } catch (error) {
    return ["error", error];
  }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<AdminUser | null> => {
    try {
      setIsAdminLoading(true);
      const [isAdminStatus, isAdminData] = await isAdmin(email);
      if (isAdminStatus === "error") {
        throw isAdminData;
      }

      if (isAdminData.isAdmin) {
        const userCred = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCred?.user;
        if (!user?.email) return null;

        setUser({
          ...user,
          role: isAdminData.role,
        });
        return { ...user, role: isAdminData.role };
      }

      setUser(null);
      if (isAdminData.error) {
        throw isAdminData.message;
      }
      return null;
    } catch (error) {
      if (error.code && error.code === "auth/invalid-credential") {
        const message = "Invalid credentials";
        setError(message);
        throw message;
      }
      setError(error);
      throw error;
    } finally {
      setIsAdminLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
      throw err;
    }
  };

  const sendResetEmail = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
      throw err;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.role) return false;
    return rolePermissions[user.role].includes(permission);
  };

  const value: AdminAuthContextType = {
    user,
    isLoading: loading || isAdminLoading,
    error,
    role: user?.role || null,
    login,
    logout,
    sendResetEmail,
    hasPermission,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
