import * as React from "react"
import { type LucideIcon, Twitter, Github, Instagram, Globe } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  // Social links (icons only)
  const socialLinks = [
    { icon: Twitter, url: "https://twitter.com/pieeapp" },
    { icon: Github, url: "https://github.com/piee-dev" },
    { icon: Instagram, url: "https://instagram.com/piee.app" },
    { icon: Globe, url: "https://piee.app" },
  ]

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>

          {/* --- Social Links Section --- */}
          <div className="flex items-center justify-center gap-4 mb-3">
            {socialLinks.map((social, index) => (
              <Link
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <social.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>

          {/* --- Navigation Items --- */}
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
