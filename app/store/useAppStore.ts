'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from '@/app/firebase'

const BASEURL = process.env.NEXT_PUBLIC_BASEURL || 'http://localhost:8000'

type UserInfo = {
  uid: string
  email: string
  name: string
  photo_url: string
  credits: number
  plan_type: string     // ✅ new
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
        const user = auth.currentUser
        if (!user) return

        const token = await user.getIdToken()
        console.log(token)
        // ✅ use dynamic base URL from env
        const res = await fetch(`${BASEURL}/user/info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error('Failed to fetch user info')
        const data = await res.json()
        set({ userInfo: data })
      },

      clearUserInfo: () => set({ userInfo: null }),
    }),
    {
      name: 'piee-user-store', // localStorage key
    }
  )
)
