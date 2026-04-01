'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth'

export type AdminRole = 'super-admin' | 'content-manager' | 'moderator'

interface AdminUser extends User {
  role?: AdminRole
}

interface AdminAuthContextType {
  user: AdminUser | null
  isLoading: boolean
  error: string | null
  role: AdminRole | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  sendResetEmail: (email: string) => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const rolePermissions: Record<AdminRole, string[]> = {
  'super-admin': [
    'manage_questions',
    'manage_tips',
    'manage_users',
    'manage_feedback',
    'manage_forum',
    'manage_billing',
    'manage_admins',
    'view_analytics',
  ],
  'content-manager': [
    'manage_questions',
    'manage_tips',
    'view_analytics',
  ],
  'moderator': [
    'manage_forum',
    'manage_users',
    'view_analytics',
  ],
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock admin users (in real app, check custom claims or Firestore)
  const adminUsers: Record<string, AdminRole> = {
    'admin@interviewpro.com': 'super-admin',
    'content@interviewpro.com': 'content-manager',
    'moderator@interviewpro.com': 'moderator',
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && adminUsers[firebaseUser.email || '']) {
        setUser({
          ...firebaseUser,
          role: adminUsers[firebaseUser.email || ''],
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const result = await signInWithEmailAndPassword(auth, email, password)

      if (!adminUsers[result.user.email || '']) {
        await signOut(auth)
        setError('You do not have admin access')
        throw new Error('Not an admin user')
      }

      setUser({
        ...result.user,
        role: adminUsers[result.user.email || ''],
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      throw err
    }
  }

  const sendResetEmail = async (email: string) => {
    try {
      setError(null)
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email'
      setError(message)
      throw err
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user?.role) return false
    return rolePermissions[user.role].includes(permission)
  }

  const value: AdminAuthContextType = {
    user,
    isLoading,
    error,
    role: user?.role || null,
    login,
    logout,
    sendResetEmail,
    hasPermission,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
