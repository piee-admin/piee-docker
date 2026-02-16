'use client'

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Coins,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"
import { ThemeToggleMenuItem } from "./theme-toggle-menu"
import { useAppStore } from "@/app/store/useAppStore"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { logOut, signIn } = useAuth()
  const router = useRouter()
  const { userInfo, fetchUserInfo } = useAppStore()

  // ✅ Handle login and logout
  const handleLogout = async () => {
    try {
      await logOut()
      router.push("/")
    } catch (error) {
      console.error("❌ Error logging out:", error)
    }
  }



  // ✅ Authenticated user dropdown
  if (!userInfo) return null;

  const isFreePlan = userInfo.plan_type === "free"
  const planLabel =
    userInfo.plan_type.charAt(0).toUpperCase() + userInfo.plan_type.slice(1)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userInfo.photo_url} alt={userInfo.name} />
                <AvatarFallback className="rounded-lg">
                  {userInfo.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* Header user info */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userInfo.photo_url} alt={userInfo.name} />
                  <AvatarFallback className="rounded-lg">
                    {userInfo.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userInfo.name}</span>
                  <span className="truncate text-xs">{userInfo.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* 💳 Plan Info */}
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <BadgeCheck />
                <span className="ml-2">Plan: {planLabel}</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Coins />
                <span className="ml-2">Credits: {userInfo.credits}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* 🌟 Upgrade */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => alert("Upgrade flow coming soon 🚀")}
                disabled={!isFreePlan}
                className={`${isFreePlan
                  ? ""
                  : "opacity-50 cursor-not-allowed"
                  }`}
              >
                <Sparkles className="mr-2" />
                {isFreePlan ? "Upgrade to Pro" : "Pro Plan Active"}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* 🧾 Account / Billing / Notifications */}
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings/account')}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* 🌗 Theme toggle */}
            <ThemeToggleMenuItem />

            <DropdownMenuSeparator />

            {/* 🚪 Logout */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer"
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}


/**<div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div> */