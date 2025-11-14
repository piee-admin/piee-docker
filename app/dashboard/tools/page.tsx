"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ImageIcon, VideoIcon, Code2, AudioLines, FileText, QrCode } from "lucide-react"

const tools = [
  {
    title: "Image Tools",
    description: "Compress, resize, and convert images easily.",
    icon: ImageIcon,
    href: "/dashboard/tools/image",
  },
  {
    title: "Video Tools",
    description: "Trim, crop, and convert video files efficiently.",
    icon: VideoIcon,
    href: "/dashboard/tools/video",
  },
  {
    title: "Code Formatter",
    description: "Format and beautify code across multiple languages.",
    icon: Code2,
    href: "/dashboard/tools/code",
  },
  {
    title: "Audio Tools",
    description: "Trim, merge, and normalize audio clips effortlessly.",
    icon: AudioLines,
    href: "/dashboard/tools/audio",
  },
  {
    title: "PDF Tools",
    description: "Merge, split, and compress PDF documents.",
    icon: FileText,
    href: "/dashboard/tools/pdf",
  },
  {
    title: "QR Tool",
    description: "Create QR code with url.",
    icon: QrCode,
    href: "/dashboard/tools/qr",
  },
]

export default function ToolsPage() {
  return (
    <div className="flex flex-col h-full w-full p-2 sm:p-4 lg:p-8">
      {/* Header */}
      <header className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Creative Tools
        </h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 max-w-2xl text-sm sm:text-base">
          Access all your creative utilities in one place. Compress images, trim videos,
          format code, and more — powered by PIEE.
        </p>
      </header>

      {/* Tool Grid */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href} className="group">
              <Card className="transition-all duration-200 hover:shadow-lg hover:border-primary/40">
                
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4 sm:size-5" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-semibold group-hover:text-primary">
                    {tool.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-xs sm:text-sm text-muted-foreground">
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
