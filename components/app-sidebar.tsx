"use client"

import * as React from "react"
import Image from "next/image"
import { useAuth } from "@/app/context/AuthContext"
import { navMain, navSecondary, projects } from "@/config/nav"; 


import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { SpinnerPiee } from "@/components/ui/spinner"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth()

  const currentUser = user
    ? {
        name: user.displayName || "User",
        email: user.email || "No email",
        avatar: user.photoURL || "/images/logo.png",
      }
    : {
        name: "Guest",
        email: "guest@piee.app",
        avatar: "/images/logo.png",
      }


  return (
    <Sidebar variant="inset" {...props}>
      {/* 🌟 Header */}
      <SidebarHeader className="pb-3 border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/library" className="flex items-center gap-3">
                <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-muted">
                  <Image
                    src="/images/logo.png"
                    alt="PIEE Logo"
                    width={36}
                    height={36}
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold tracking-tight text-base">
                    PIEE
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground font-medium">
                    {user ? "Pro Workspace" : "Guest Mode"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 📦 Content */}
      <SidebarContent>
        <NavMain items={navMain} />
        {/*<NavProjects projects={projects} />*/}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* 👤 Footer */}
      <SidebarFooter className="border-t border-border p-4">
        <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground">
          <p>Version 0.0.1+b</p>
          <p>
            Made with <span className="inline-block animate-bounce">❤️</span> in India.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
