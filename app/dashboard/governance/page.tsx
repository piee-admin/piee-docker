'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, CreditCard, FileText, Users, TrendingUp, Shield, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GovernancePage() {
    const [stats, setStats] = useState({
        totalOrgs: 0,
        totalMembers: 0,
        totalCredits: 0,
        totalGenerations: 0,
    })

    const orgId = "default-org"

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        // In production, fetch real stats from API
        setStats({
            totalOrgs: 1,
            totalMembers: 1,
            totalCredits: 0,
            totalGenerations: 0,
        })
    }

    const formatCredits = (microCredits: number) => {
        return `$${(microCredits / 1000000).toFixed(2)}`
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight">Governance</h2>
            </div>

            <p className="text-muted-foreground">
                Manage organizations, monitor usage, and maintain compliance across your AI infrastructure.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrgs}</div>
                        <p className="text-xs text-muted-foreground">Active organizations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMembers}</div>
                        <p className="text-xs text-muted-foreground">Across all orgs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCredits(stats.totalCredits)}</div>
                        <p className="text-xs text-muted-foreground">BYOK - No balance needed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Generations</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalGenerations}</div>
                        <p className="text-xs text-muted-foreground">Total executions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:border-primary transition-colors cursor-pointer">
                    <Link href="/dashboard/governance/orgs">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <CardTitle>Organizations</CardTitle>
                            </div>
                            <CardDescription>
                                Manage organization settings, members, and permissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Active Orgs</span>
                                    <span className="font-medium">{stats.totalOrgs}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total Members</span>
                                    <span className="font-medium">{stats.totalMembers}</span>
                                </div>
                            </div>
                            <Button className="w-full mt-4" variant="outline">
                                Manage Organizations
                            </Button>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="hover:border-primary transition-colors cursor-pointer">
                    <Link href="/dashboard/governance/credits">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                <CardTitle>Credits & Usage</CardTitle>
                            </div>
                            <CardDescription>
                                Monitor credit consumption and usage patterns
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Available Balance</span>
                                    <span className="font-medium">{formatCredits(stats.totalCredits)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Mode</span>
                                    <span className="font-medium">BYOK</span>
                                </div>
                            </div>
                            <Button className="w-full mt-4" variant="outline">
                                View Usage Details
                            </Button>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="hover:border-primary transition-colors cursor-pointer">
                    <Link href="/dashboard/governance/audit">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <CardTitle>Audit Trail</CardTitle>
                            </div>
                            <CardDescription>
                                Complete audit log of all system activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total Events</span>
                                    <span className="font-medium">{stats.totalGenerations}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Retention</span>
                                    <span className="font-medium">90 days</span>
                                </div>
                            </div>
                            <Button className="w-full mt-4" variant="outline">
                                View Audit Logs
                            </Button>
                        </CardContent>
                    </Link>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                        Latest governance events across all organizations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[200px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <p className="text-sm text-muted-foreground">No recent activity to display</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Compliance & Security</CardTitle>
                    <CardDescription>
                        Security status and compliance overview
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm">API Keys Encrypted (AES-256)</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm">BYOK Mode Enabled</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm">Audit Logging</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                <span className="text-sm">Multi-Factor Authentication</span>
                            </div>
                            <span className="text-sm font-medium text-yellow-600">Not Configured</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
