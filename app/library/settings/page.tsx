"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { User, CreditCard, Users, Gauge } from "lucide-react"

const settings = [
  {
    title: "Account",
    description: "Manage your profile, email, password, and security.",
    icon: User,
    href: "/dashboard/settings/account",
  },
  {
    title: "Billing",
    description: "View invoices, payment methods, and subscriptions.",
    icon: CreditCard,
    href: "/dashboard/settings/billing",
  },
  {
    title: "Workspace",
    description: "Configure team members, roles, and workspace preferences.",
    icon: Users,
    href: "/dashboard/settings/workspace",
  },
  {
    title: "Limits",
    description: "Monitor usage, quotas, and monthly limits.",
    icon: Gauge,
    href: "/dashboard/settings/limits",
  },
]

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full w-full p-2 sm:p-4 lg:p-8">
      {/* Header */}
      <header className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 max-w-2xl text-sm sm:text-base">
          Manage your account, billing, workspace, and usage limits all from one place.
        </p>
      </header>

      {/* Settings Grid */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {settings.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card className="transition-all duration-200 hover:shadow-lg hover:border-primary/40">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4 sm:size-5" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-semibold group-hover:text-primary">
                    {item.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-xs sm:text-sm text-muted-foreground">
                  {item.description}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

