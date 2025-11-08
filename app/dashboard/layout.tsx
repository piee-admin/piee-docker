"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/app/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LoginDialog } from "@/components/LoginDialog"
import { SpinnerPiee } from "@/components/ui/spinner"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logOut, loading } = useAuth()
  const [openLogin, setOpenLogin] = useState(false)
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)

  // 🌀 Loading screen
  if (loading && !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <SpinnerPiee className="size-8" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* HEADER */}
        <header className="flex h-14 sm:h-16 shrink-0 items-center justify-between px-3 sm:px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Left: Sidebar trigger + Breadcrumbs */}
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 mx-1 sm:mx-2" />

            <Breadcrumb>
              <BreadcrumbList>
                {pathSegments.map((segment, index) => {
                  const href = "/" + pathSegments.slice(0, index + 1).join("/")
                  const isLast = index === pathSegments.length - 1
                  const label = segment
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())

                  return (
                    <BreadcrumbItem key={href}>
                      {index > 0 && <BreadcrumbSeparator />}
                      {isLast ? (
                        <BreadcrumbPage className="truncate max-w-[100px] sm:max-w-none">
                          {label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={href} className="truncate">
                            {label}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: Avatar / Login */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!user ? (
              <Button
                size="sm"
                variant="secondary"
                className="text-xs sm:text-sm"
                onClick={() => setOpenLogin(true)}
              >
                Login
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer h-8 w-8">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback>
                      {user?.displayName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logOut}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Login modal */}
          <LoginDialog open={openLogin} onOpenChange={setOpenLogin} />
        </header>

        {/* BODY */}
        <main className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="flex-1 w-full h-full bg-background rounded-lg border border-border/40 p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
