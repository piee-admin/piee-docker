'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Download, Filter } from "lucide-react"
import { APIClient, apiClient, type Generation } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function GenerationsPage() {
    const [generations, setGenerations] = useState<Generation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            // 1. Get user's organization
            const orgs = await apiClient.organizations.list()
            if (orgs.length === 0) {
                // Should not happen for onboarded users, but handle gracefully
                setLoading(false)
                return
            }
            const orgId = orgs[0].id

            // 2. Fetch generations for this org
            const data = await apiClient.generations.list(orgId)
            setGenerations(data)
        } catch (error) {
            console.error('Failed to load generations:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCost = (microCredits: number) => {
        return `$${(microCredits / 1000000).toFixed(4)}`
    }

    const filteredGenerations = generations.filter(gen =>
        gen.output_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gen.model.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">Generations</h2>
                </div>
                <Button variant="outline" disabled={generations.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search generations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Models</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="flex h-[400px] items-center justify-center">
                        <p className="text-muted-foreground">Loading execution logs...</p>
                    </CardContent>
                </Card>
            ) : generations.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Execution Logs</CardTitle>
                        <CardDescription>
                            Immutable audit trail of all AI generations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
                            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                                <FileText className="h-10 w-10 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No logs found</h3>
                                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                    Prompt execution results will appear here in real-time.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Execution History</CardTitle>
                        <CardDescription>
                            {filteredGenerations.length} generation{filteredGenerations.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Tokens</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Latency</TableHead>
                                    <TableHead>Output</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredGenerations.map((gen) => (
                                    <TableRow key={gen.id}>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(gen.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{gen.model}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {gen.tokens_prompt + gen.tokens_completion}
                                        </TableCell>
                                        <TableCell className="text-sm font-mono">
                                            {formatCost(gen.cost)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {gen.latency_ms}ms
                                        </TableCell>
                                        <TableCell className="max-w-md truncate text-sm">
                                            {gen.output_text}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
