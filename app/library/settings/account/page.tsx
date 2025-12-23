"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/app/store/useAppStore"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import Image from "next/image"
import { OpenAPI } from "@/app/library/api"

// 🧩 UI Components
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/alert-dialog"

import { LogOut } from "lucide-react"

export default function AccountSettingsPage() {
  const { userInfo, fetchUserInfo } = useAppStore()
  const { user, logOut } = useAuth()
  const router = useRouter()

  // ⭐ Saved prompts state
  const [savedPrompts, setSavedPrompts] = useState<any[]>([])
  const [loadingSaved, setLoadingSaved] = useState(false)

  // 🚀 Fetch user info
  useEffect(() => {
    if (!userInfo) {
      fetchUserInfo().catch((err) => {
        console.error("Error fetching user info:", err)
      })
    }
  }, [userInfo, fetchUserInfo])

  // ⭐ Fetch saved prompts (SAME LOGIC STYLE)
  useEffect(() => {
    if (!user) return

    const fetchSavedPrompts = async () => {
      try {
        setLoadingSaved(true)

        const token = await user.getIdToken()

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASEURL}/library/prompts/liked?limit=10&offset=0`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await res.json()
        setSavedPrompts(data.items ?? data)
      } catch (err) {
        console.error("Failed to fetch saved prompts", err)
      } finally {
        setLoadingSaved(false)
      }
    }

    fetchSavedPrompts()
  }, [user])

  // 🔐 Logout
  const handleLogout = async () => {
    try {
      await logOut()
      toast.success("Logged out successfully")
      setTimeout(() => router.push("/dashboard"), 600)
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  // ⏳ Loading state
  if (!userInfo) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

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
            Manage your profile and saved prompts.
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-2">
              <LogOut className="w-4 h-4" /> Log Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You’ll be logged out of your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <Separator className="mb-8" />

      {/* Profile Card */}
      {/* Profile Card */}
      <Card className="max-w-xl mx-auto mb-12 border border-border/60 bg-background/70 backdrop-blur-sm shadow-sm">
        <CardHeader className="flex flex-col items-center text-center gap-4 pt-8 pb-4">
          {/* Avatar */}
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full ring-2 ring-primary/40" />
            <Image
              src={userInfo.photo_url || "/default-avatar.png"}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full object-cover mx-auto mt-2"
              priority
            />
          </div>

          {/* Name + Email */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              {userInfo.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {userInfo.email}
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8 space-y-4">
          {/* Credits */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-sm text-muted-foreground">
              Account Credits
            </span>
            <Badge variant="secondary" className="px-3 py-1">
              {userInfo.credits} credits
            </Badge>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              Status
            </span>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ⭐ Saved Prompts */}
      {/* 🃏 Saved Prompts */}
      <div className="max-w-6xl mx-auto w-full mt-14">
        <h2 className="text-xl font-semibold mb-6">Saved Prompts</h2>

        {/* Loading */}
        {loadingSaved && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-[320px] w-full rounded-2xl"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loadingSaved && savedPrompts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            You haven’t saved any prompts yet.
          </p>
        )}

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {savedPrompts.map((prompt) => (
            <Link
              key={prompt.id}
              href={`/library/prompt/${prompt.id}`}
              className="group"
            >
              <Card
                className="
            relative overflow-hidden rounded-2xl
            bg-background
            border border-border/60
            shadow-sm
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-lg
          "
              >
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={
                      prompt.thumbnail_url ||
                      prompt.cover_url ||
                      "/prompt-placeholder.png"
                    }
                    alt={prompt.title}
                    fill
                    className="
                object-cover
                transition-transform duration-300
                group-hover:scale-105
              "
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                </div>

                {/* Content */}
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {prompt.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {prompt.description}
                  </p>

                  <div className="flex gap-2 pt-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">
                      {prompt.type}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {prompt.model}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>


      {/* Help */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        Need help?{" "}
        <Link href="/support" className="text-primary hover:underline">
          Contact Support
        </Link>
      </div>
    </motion.div>
  )
}
