// app/context/AuthContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  onIdTokenChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User,
  UserCredential,
} from 'firebase/auth'
import { auth } from '@/app/firebase'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: () => Promise<UserCredential>
  logOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // hydrate immediately from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem('pieeUser')
      if (cached) {
        const parsed = JSON.parse(cached)
        setUser(parsed)
        setLoading(false) // stop blocking
      } else {
        setLoading(true)
      }
    } catch (err) {
      console.error('Auth hydrate error', err)
      localStorage.removeItem('pieeUser')
      setLoading(true)
    }
  }, [])

  // background Firebase sync using onIdTokenChanged
  useEffect(() => {
    let unsub: (() => void) | null = null

    const init = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence)
      } catch (err) {
        console.warn('setPersistence failed', err)
      }

      unsub = onIdTokenChanged(auth, (fbUser) => {
        // debug
        console.debug('onIdTokenChanged → fbUser', !!fbUser, fbUser?.uid)

        if (fbUser) {
          // only write to storage if different
          try {
            localStorage.setItem('pieeUser', JSON.stringify({
              uid: fbUser.uid,
              displayName: fbUser.displayName,
              email: fbUser.email,
              photoURL: fbUser.photoURL,
              // avoid token objects — keep minimal profile fields
            }))
          } catch (e) {
            console.error('localStorage set error', e)
          }
          setUser(fbUser)
        } else {
          localStorage.removeItem('pieeUser')
          setUser(null)
        }

        setLoading(false)
        setInitialized(true)
      })
    }

    init()

    return () => {
      if (unsub) unsub()
    }
  }, [])

  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    // store minimal user object (avoid internal token blobs)
    const minimal = {
      uid: result.user.uid,
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
    }
    localStorage.setItem('pieeUser', JSON.stringify(minimal))
    setUser(result.user)
    setLoading(false)
    return result
  }

  const logOut = async () => {
    await signOut(auth)
    localStorage.removeItem('pieeUser')
    setUser(null)
    setLoading(false)
  }

  const value = useMemo(() => ({ user, loading, signIn, logOut }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}




