// app/store/useAppStore.ts
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getToken } from '@/lib/auth/session'

const BASEURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type UserInfo = {
  uid: string
  email: string
  name: string
  photo_url: string
  credits: number
  plan_type: string
}

type AppState = {
  userInfo: UserInfo | null
  fetchUserInfo: () => Promise<void>
  clearUserInfo: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userInfo: null,

      fetchUserInfo: async () => {
        const token = getToken()
        if (!token) return

        // Fetch user context info from internal API
        const res = await fetch(`${BASEURL}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error('Failed to fetch user info')
        const data = await res.json()

        // Map backend schema to store schema if needed
        set({
          userInfo: {
            uid: data.id,
            email: data.email,
            name: data.display_name || data.email,
            photo_url: data.photo_url || '',
            credits: data.credits || 0,
            plan_type: data.plan_type || 'free'
          }
        })
      },

      clearUserInfo: () => set({ userInfo: null }),
    }),
    {
      name: 'piee-user-store', // localStorage key
    }
  )
)
