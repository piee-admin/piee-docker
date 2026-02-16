'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Search, Download, Filter, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AuditEvent {
    id: string
    timestamp: string
    user: string
    action: string
    resource: string
    status: 'success' | 'failure'
    details: string
}

export default function AuditTrailPage() {
    const [events, setEvents] = useState<AuditEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterAction, setFilterAction] = useState('all')

    useEffect(() => {
        loadAuditEvents()
    }, [])

    const loadAuditEvents = async () => {
        try {
            setLoading(true)
            // In production, fetch from /api/v1/audit
            setEvents([])
        } catch (error) {
            console.error('Failed to load audit events:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.user.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterAction === 'all' || event.action === filterAction
        return matchesSearch && matchesFilter
    })

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
                </div>
                <Button variant="outline" disabled={events.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Export Logs
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.length}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Events logged</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">100%</div>
                        <p className="text-xs text-muted-foreground">No failures</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Retention</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">90 days</div>
                        <p className="text-xs text-muted-foreground">Log retention</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search audit logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="create">Create</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                        <SelectItem value="execute">Execute</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="flex h-[400px] items-center justify-center">
                        <p className="text-muted-foreground">Loading audit events...</p>
                    </CardContent>
                </Card>
            ) : events.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Audit Events</CardTitle>
                        <CardDescription>
                            Complete immutable log of all system activities.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
                            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                                <FileText className="h-10 w-10 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No audit events found</h3>
                                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                    System activities will be logged here automatically. All events are immutable and retained for 90 days.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Audit Events</CardTitle>
                        <CardDescription>
                            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Resource</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-medium">{event.user}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{event.action}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">{event.resource}</TableCell>
                                        <TableCell>
                                            <Badge variant={event.status === 'success' ? 'default' : 'destructive'}>
                                                {event.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-md truncate text-sm">
                                            {event.details}
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
