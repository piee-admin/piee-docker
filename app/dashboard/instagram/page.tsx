"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Instagram,
  Video,
  Music2,
  Grid,
  Upload,
  Hash,
  Type,
  Calendar,
  BarChart3,
} from "lucide-react"

const instagramTools = [
  {
    title: "Reel Downloader",
    description: "Download Instagram Reels in HD quality with a single click.",
    icon: Video,
    href: "/dashboard/instagram/reel-downloader",
  },
  {
    title: "Audio Downloader",
    description: "Extract and download music or audio from Reels and posts.",
    icon: Music2,
    href: "/dashboard/instagram/audio-downloader",
  },
  {
    title: "Wall Preview",
    description: "Preview how your grid will look before posting on Instagram.",
    icon: Grid,
    href: "/dashboard/instagram/wall-preview",
  },
  {
    title: "Test Upload Preview",
    description: "Simulate and visualize how your posts will appear on your feed.",
    icon: Upload,
    href: "/dashboard/instagram/test-upload",
  },
  {
    title: "Hashtag Generator",
    description: "Generate relevant and trending hashtags using AI.",
    icon: Hash,
    href: "/dashboard/instagram/hashtag-generator",
  },
  {
    title: "Caption Generator",
    description: "Create viral, AI-powered captions for posts and carousels.",
    icon: Type,
    href: "/dashboard/instagram/caption-generator",
  },
  {
    title: "Post Scheduler",
    description: "Plan your Instagram posts visually and organize your content calendar.",
    icon: Calendar,
    href: "/dashboard/instagram/scheduler",
  },
  {
    title: "Profile Analyzer",
    description: "Analyze engagement metrics and get insights from any public profile.",
    icon: BarChart3,
    href: "/dashboard/instagram/analyzer",
  },
]

export default function InstagramToolsPage() {
  return (
    <div className="flex flex-col h-full w-full p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <Instagram className="size-6 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">Instagram Tools</h1>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage, analyze, and enhance your Instagram content seamlessly. 
          From downloading Reels to generating captions — everything you need for your social presence, powered by PIEE.
        </p>
      </header>

      {/* Tool Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {instagramTools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href} className="group">
              <Card
                className={cn(
                  "transition-all duration-200 hover:shadow-lg hover:border-primary/40"
                )}
              >
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary">
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {tool.description}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
