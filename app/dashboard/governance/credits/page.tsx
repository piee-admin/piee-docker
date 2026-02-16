'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Wallet, TrendingUp, DollarSign } from "lucide-react"
import { APIClient } from "@/lib/api-client"

export default function CreditsPage() {
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(true)

    const orgId = "default-org"

    useEffect(() => {
        loadBalance()
    }, [])

    const loadBalance = async () => {
        try {
            setLoading(true)
            // In production, fetch from /api/v1/credits/{orgId}/balance
            setBalance(0)
        } catch (error) {
            console.error('Failed to load balance:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCredits = (microCredits: number) => {
        return `$${(microCredits / 1000000).toFixed(2)}`
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight">Credits & Usage</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCredits(balance)}</div>
                        <p className="text-xs text-muted-foreground">BYOK - No balance needed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">0 generations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Across all models</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0ms</div>
                        <p className="text-xs text-muted-foreground">Response time</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Consumption History</CardTitle>
                    <CardDescription>
                        Detailed breakdown of credit usage across providers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[300px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <p className="text-sm text-muted-foreground">No transactions found. Execute prompts to see usage data.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Usage by Provider</CardTitle>
                    <CardDescription>
                        Cost breakdown by AI provider
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm">OpenAI</span>
                            </div>
                            <span className="text-sm font-medium">$0.00</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <span className="text-sm">Anthropic</span>
                            </div>
                            <span className="text-sm font-medium">$0.00</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-500" />
                                <span className="text-sm">Google AI</span>
                            </div>
                            <span className="text-sm font-medium">$0.00</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
