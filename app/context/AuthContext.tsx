// app/context/AuthContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authClient } from '@/lib/auth/client'
import { clearToken, getToken, setToken } from '@/lib/auth/session'

type User = {
  id: string
  email: string
  displayName?: string
  photoURL?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  logOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Sync session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()
      if (token) {
        try {
          const userData = await authClient.getSession()
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              displayName: userData.display_name,
              photoURL: userData.photo_url
            })
          } else {
            clearToken()
            setUser(null)
          }
        } catch (err) {
          console.error('Session sync error', err)
          clearToken()
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const data = await authClient.login(email, password)
      if (data.access_token) {
        setToken(data.access_token)
        const userData = await authClient.getSession()
        const profile = {
          id: userData.id,
          email: userData.email,
          displayName: userData.display_name,
          photoURL: userData.photo_url
        }
        setUser(profile)
        return data
      }
      throw new Error('Login failed')
    } catch (err) {
      setLoading(false)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logOut = async () => {
    try {
      await authClient.logout()
    } finally {
      clearToken()
      setUser(null)
      setLoading(false)
    }
  }

  const value = useMemo(() => ({ user, loading, signIn, logOut }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
