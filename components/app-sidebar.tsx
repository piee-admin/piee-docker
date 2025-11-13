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
  Instagram,
  Music2,
  Video,
  Grid,
  Upload,
  Hash,
  Type,
  Calendar,
  BarChart3,
  QrCode,
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
      title: "Instagram Tools",
      url: "/dashboard/instagram",
      icon: Instagram,
      isActive: true,
      items: [
        { title: "Reel Downloader", url: "/dashboard/instagram/reel-downloader", icon: Video },
        { title: "Audio Downloader", url: "/dashboard/instagram/audio-downloader", icon: Music2 },
        { title: "Wall Preview", url: "/dashboard/instagram/wall-preview", icon: Grid },
        { title: "Test Upload Preview", url: "/dashboard/instagram/test-upload", icon: Upload },
        { title: "Hashtag Generator", url: "/dashboard/instagram/hashtag-generator", icon: Hash },
        { title: "Caption Generator", url: "/dashboard/instagram/caption-generator", icon: Type },
        { title: "Post Scheduler", url: "/dashboard/instagram/scheduler", icon: Calendar },
        { title: "Profile Analyzer", url: "/dashboard/instagram/analyzer", icon: BarChart3 },
      ],
    },
    {
      title: "Creative Tools",
      url: "/dashboard/tools",
      icon: Bot,
      isActive: false,
      items: [
        { title: "Image Tools", url: "/dashboard/tools/image" },
        { title: "Video Tools", url: "/dashboard/tools/video" },
        { title: "Code Formatter", url: "/dashboard/tools/code" },
        { title: "Audio Tools", url: "/dashboard/tools/audio" },
        { title: "PDF Tools", url: "/dashboard/tools/pdf" },
        { title: "QR Tool", url: "/dashboard/tools/qr" },
      ],
    },
    
    {
      title: "AI Models",
      url: "/dashboard/ai",
      icon: Bot,
      isActive: false,
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
      isActive: false,
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
    { title: "Community", url: "https://discord.gg/sR9bN3wW", icon: Map },
  ]

  const projects = [
    { name: "Image Toolkit", url: "/dashboard/projects/image-toolkit", icon: Frame },
    { name: "Video Editor", url: "/dashboard/projects/video-editor", icon: PieChart },
    { name: "Code Formatter Suite", url: "/dashboard/projects/code-suite", icon: Map },
    { name: "QR Code Genrator", url: "/dashboard/projects/qrcode-generator", icon:QrCode  }
  ]
  
  return (
    <Sidebar variant="inset" {...props}>
      {/* 🌟 Header */}
      <SidebarHeader className="pb-3 border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center gap-3">
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
        <NavProjects projects={projects} />
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
