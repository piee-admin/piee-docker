'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  TrendingUp,
  Zap,
  FileText,
  Key,
  Building2,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface DashboardStats {
  totalPrompts: number
  totalGenerations: number
  totalProviderKeys: number
  totalOrganizations: number
  recentGenerations: Array<{
    id: string
    prompt_name: string
    provider: string
    status: string
    created_at: string
    tokens_used: number
  }>
  systemHealth: {
    api: 'healthy' | 'degraded' | 'down'
    database: 'healthy' | 'degraded' | 'down'
    encryption: 'active' | 'inactive'
  }
}

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPrompts: 0,
    totalGenerations: 0,
    totalProviderKeys: 0,
    totalOrganizations: 1,
    recentGenerations: [],
    systemHealth: {
      api: 'healthy',
      database: 'healthy',
      encryption: 'active'
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      // In production, fetch from /api/v1/dashboard/stats
      // For now, using mock data
      setStats({
        totalPrompts: 0,
        totalGenerations: 0,
        totalProviderKeys: 0,
        totalOrganizations: 1,
        recentGenerations: [],
        systemHealth: {
          api: 'healthy',
          database: 'healthy',
          encryption: 'active'
        }
      })
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return <Badge className="bg-green-500">Healthy</Badge>
      case 'degraded':
        return <Badge className="bg-yellow-500">Degraded</Badge>
      case 'down':
      case 'inactive':
        return <Badge variant="destructive">Down</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome to your AI Control Plane
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrompts}</div>
            <p className="text-xs text-muted-foreground">
              Versioned prompt templates
            </p>
            <Link href="/dashboard/prompts">
              <Button variant="link" className="px-0 mt-2" size="sm">
                Manage Prompts <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGenerations}</div>
            <p className="text-xs text-muted-foreground">
              Total AI executions
            </p>
            <Link href="/dashboard/generations">
              <Button variant="link" className="px-0 mt-2" size="sm">
                View Logs <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provider Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProviderKeys}</div>
            <p className="text-xs text-muted-foreground">
              BYOK - Encrypted at rest
            </p>
            <Link href="/dashboard/settings/providers">
              <Button variant="link" className="px-0 mt-2" size="sm">
                Manage Keys <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              Active organizations
            </p>
            <Link href="/dashboard/governance/orgs">
              <Button variant="link" className="px-0 mt-2" size="sm">
                View Orgs <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Generations</CardTitle>
                <CardDescription>
                  Latest AI prompt executions
                </CardDescription>
              </div>
              <Link href="/dashboard/generations">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentGenerations.length === 0 ? (
              <div className="flex h-[300px] shrink-0 items-center justify-center rounded-md border border-dashed">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                  <Activity className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No generations yet</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Start by adding a provider key and creating your first prompt.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/dashboard/settings/providers">
                      <Button size="sm">Add Provider Key</Button>
                    </Link>
                    <Link href="/dashboard/prompts">
                      <Button variant="outline" size="sm">Create Prompt</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentGenerations.map((gen) => (
                  <div key={gen.id} className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{gen.prompt_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{gen.provider}</Badge>
                        <span>{new Date(gen.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{gen.tokens_used} tokens</span>
                      {gen.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & System Health */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/prompts">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Create New Prompt
              </Button>
            </Link>
            <Link href="/dashboard/settings/providers">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Key className="mr-2 h-4 w-4" />
                Add Provider Key
              </Button>
            </Link>
            <Link href="/dashboard/api-keys">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Key className="mr-2 h-4 w-4" />
                Generate API Key
              </Button>
            </Link>
            <Link href="/dashboard/governance">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Building2 className="mr-2 h-4 w-4" />
                Governance Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
            Real-time status of all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Service</span>
                {getHealthBadge(stats.systemHealth.api)}
              </div>
              <Progress value={stats.systemHealth.api === 'healthy' ? 100 : 50} className="h-2" />
              <p className="text-xs text-muted-foreground">All endpoints operational</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                {getHealthBadge(stats.systemHealth.database)}
              </div>
              <Progress value={stats.systemHealth.database === 'healthy' ? 100 : 50} className="h-2" />
              <p className="text-xs text-muted-foreground">Connection stable</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Encryption</span>
                {getHealthBadge(stats.systemHealth.encryption)}
              </div>
              <Progress value={stats.systemHealth.encryption === 'active' ? 100 : 0} className="h-2" />
              <p className="text-xs text-muted-foreground">AES-256 encryption active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to set up your AI Control Plane
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${stats.totalProviderKeys > 0 ? 'bg-green-500' : 'bg-muted'}`}>
                <span className="text-sm font-medium text-white">1</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Add Your Provider Keys (BYOK)</p>
                <p className="text-sm text-muted-foreground">
                  Securely store your OpenAI, Anthropic, or Google AI API keys
                </p>
                {stats.totalProviderKeys === 0 && (
                  <Link href="/dashboard/settings/providers">
                    <Button variant="link" className="px-0 h-auto" size="sm">
                      Add Provider Key <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${stats.totalPrompts > 0 ? 'bg-green-500' : 'bg-muted'}`}>
                <span className="text-sm font-medium text-white">2</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Create Your First Prompt</p>
                <p className="text-sm text-muted-foreground">
                  Design versioned prompt templates with variables
                </p>
                {stats.totalPrompts === 0 && (
                  <Link href="/dashboard/prompts">
                    <Button variant="link" className="px-0 h-auto" size="sm">
                      Create Prompt <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <span className="text-sm font-medium text-white">3</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Execute Prompts via API</p>
                <p className="text-sm text-muted-foreground">
                  Generate an API key and start making requests
                </p>
                <Link href="/dashboard/api-keys">
                  <Button variant="link" className="px-0 h-auto" size="sm">
                    Generate API Key <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <span className="text-sm font-medium text-white">4</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Monitor & Govern</p>
                <p className="text-sm text-muted-foreground">
                  Track usage, manage teams, and maintain compliance
                </p>
                <Link href="/dashboard/governance">
                  <Button variant="link" className="px-0 h-auto" size="sm">
                    Open Governance <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}