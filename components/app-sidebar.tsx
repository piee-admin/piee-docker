"use client"

import * as React from "react"
import Image from "next/image"
import { useAuth } from "@/app/context/AuthContext"
import {
  BookOpen,
  Bot,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth()



  // 👤 User info fallback
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

  // 📚 Sidebar navigation (Dashboard paths)
  // 🧭 Main navigation (for creative tools and AI utilities)
const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "Overview", url: "/dashboard/overview" },
      { title: "Activity", url: "/dashboard/activity" },
      { title: "Shortcuts", url: "/dashboard/shortcuts" },
    ],
  },
  {
    title: "Creative Tools",
    url: "/dashboard/tools",
    icon: Bot,
    items: [
      { title: "Image Tools", url: "/dashboard/tools/image" },     // compress, resize, convert
      { title: "Video Tools", url: "/dashboard/tools/video" },     // trim, crop, convert
      { title: "Code Formatter", url: "/dashboard/tools/code" },   // JS, TS, Python, etc.
      { title: "Audio Tools", url: "/dashboard/tools/audio" },     // cut, normalize, merge
      { title: "PDF Tools", url: "/dashboard/tools/pdf" },         // merge, split, compress
    ],
  },
  {
    title: "AI Models",
    url: "/dashboard/ai",
    icon: Bot,
    items: [
      { title: "Text Generation", url: "/dashboard/ai/text" },
      { title: "Image Generation", url: "/dashboard/ai/image" },
      { title: "Video Generation", url: "/dashboard/ai/video" },
      { title: "Speech & Audio", url: "/dashboard/ai/audio" },
      { title: "Prompt Library", url: "/dashboard/ai/prompts" },
    ],
  },
  {
    title: "Automation",
    url: "/dashboard/automation",
    icon: Frame,
    items: [
      { title: "Workflows", url: "/dashboard/automation/workflows" },
      { title: "Integrations", url: "/dashboard/automation/integrations" },
      { title: "Triggers", url: "/dashboard/automation/triggers" },
    ],
  },
  {
    title: "Documentation",
    url: "/dashboard/docs",
    icon: BookOpen,
    items: [
      { title: "Introduction", url: "/dashboard/docs/intro" },
      { title: "Quick Start", url: "/dashboard/docs/get-started" },
      { title: "API Reference", url: "/dashboard/docs/api" },
      { title: "CLI Guide", url: "/dashboard/docs/cli" },
      { title: "Changelog", url: "/dashboard/docs/changelog" },
    ],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
    items: [
      { title: "Account", url: "/dashboard/settings/account" },
      { title: "Billing", url: "/dashboard/settings/billing" },
      { title: "Workspace", url: "/dashboard/settings/workspace" },
      { title: "Limits", url: "/dashboard/settings/limits" },
    ],
  },
]
const navSecondary = [
  { title: "Support", url: "/dashboard/support", icon: LifeBuoy },
  { title: "Feedback", url: "/dashboard/feedback", icon: Send },
  { title: "Community", url: "https://discord.gg/piee", icon: Map }, // external link (example)
]
const projects = [
  { name: "Image Toolkit", url: "/dashboard/projects/image-toolkit", icon: Frame },
  { name: "Video Editor", url: "/dashboard/projects/video-editor", icon: PieChart },
  { name: "Code Formatter Suite", url: "/dashboard/projects/code-suite", icon: Map },
]


  return (
    <Sidebar variant="inset" {...props}>
      {/* 🌟 PIEE Header */}
      <SidebarHeader className="pb-3 border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard" className="flex items-center gap-3">
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
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* 🪄 PIEE Tagline */}
        <div className="mt-3 px-2 text-xs text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground">
            The universal open-source creative command palette.
          </p>
          <p>Compress images, trim videos, and format code with a single shortcut.</p>
        </div>
      </SidebarHeader>

      {/* 📦 Sidebar Content */}
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* 👤 Sidebar Footer */}
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
