'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

import { useAppStore } from '@/app/store/useAppStore'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from "sonner"
import Image from 'next/image'

// 🧩 UI Components
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

import { LogOut } from 'lucide-react'

export default function AccountSettingsPage() {
  const { userInfo, fetchUserInfo } = useAppStore()
  const { logOut } = useAuth()
  const router = useRouter()

  // 🚀 Fetch user info on mount
  useEffect(() => {
    if (!userInfo) {
      fetchUserInfo().catch((err) => {
        console.error('Error fetching user info:', err)
      })
    }
  }, [userInfo, fetchUserInfo])



  const handleLogout = async () => {
    try {
      // Perform logout
      await logOut()

      // ✅ Show success toast using Sonner
      toast.success('Logged out successfully', {
        description: 'You have been signed out of your account.',
        duration: 3000, // optional (default: 4000)
      })

      // Redirect after a short delay (for smooth UX)
      setTimeout(() => {
        router.push('/dashboard')
      }, 600)
    } catch (error) {
      console.error('❌ Error logging out:', error)

      // ❌ Show error toast using Sonner
      toast.error('Logout failed', {
        description: 'Something went wrong. Please try again.',
        duration: 4000,
      })
    }
  }


  // ⏳ Loading state
  if (!userInfo) {
    return (
      <div className="p-8 flex flex-col space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="flex items-center space-x-4 mt-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </div>
    )
  }

  // 🌟 Main Page
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full w-full px-4 sm:px-8 py-6"
    >
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile, email, password, and security settings.
          </p>
        </div>

        {/* 🔐 Logout Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You’ll be signed out from your account and redirected to the
                dashboard. Make sure any unsaved data is backed up.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                Confirm Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <Separator className="mb-8" />

      {/* Profile Card */}
      <Card className="max-w-xl mx-auto border border-border/60 bg-background/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-col items-center space-y-3">
          <div className="relative w-24 h-24">
            {/* Outer ring (keeps same size) */}
            <div className="absolute inset-0 rounded-full ring-2 ring-primary/40"></div>

            {/* Smaller inner image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={userInfo?.photo_url || "/default-avatar.png"}
                alt="Profile"
                width={80}  // smaller actual image
                height={80}
                className="rounded-full  shadow-sm object-cover"
                priority
              />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold">{userInfo?.name}</h2>
            <p className="text-muted-foreground text-sm">{userInfo?.email}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <span className="text-sm text-muted-foreground">
              Account Credits
            </span>
            <span className='px-5'></span>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {userInfo?.credits} credits
            </Badge>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-muted-foreground">Status</span>

            <Badge className="text-sm px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="mt-12 max-w-xl mx-auto text-center text-sm text-muted-foreground">
        Need help managing your account?{' '}
        <Link href="/support" className="text-primary hover:underline">
          Contact Support
        </Link>
      </div>
    </motion.div>
  )
}
