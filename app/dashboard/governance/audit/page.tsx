'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Search, Download, Filter, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/app/context/AuthContext'
import { toast } from "sonner"

interface AuditEvent {
    id: string
    timestamp: string
    user_id: string
    action: string
    resource_type: string
    resource_id: string
    status: 'success' | 'failure'
    details: string
    ip_address?: string
    user_agent?: string
}

export default function AuditTrailPage() {
    const { user } = useAuth()
    const [events, setEvents] = useState<AuditEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterAction, setFilterAction] = useState('all')
    const [date, setDate] = useState<Date | undefined>(undefined)

    useEffect(() => {
        if (user) {
            loadAuditEvents()
        }
    }, [user, filterAction, date])

    const loadAuditEvents = async () => {
        try {
            setLoading(true)
            const params: any = { limit: 100 }

            if (filterAction !== 'all') {
                params.action = filterAction
            }

            if (date) {
                params.start_date = date.toISOString()
                // Set end date to end of that day
                const endDate = new Date(date)
                endDate.setHours(23, 59, 59, 999)
                params.end_date = endDate.toISOString()
            }

            const data = await apiClient.audit.list(params)
            setEvents(data)
        } catch (error) {
            console.error('Failed to load audit events:', error)
            toast.error("Failed to load audit logs")
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            toast.success("Exporting logs...")
            const data = await apiClient.audit.export(
                date ? date.toISOString() : undefined,
                date ? new Date(date.getTime() + 86400000).toISOString() : undefined
            )

            // Create and download JSON file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.json`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success("Export complete")
        } catch (error) {
            console.error('Export failed:', error)
            toast.error("Failed to export logs")
        }
    }

    // Client-side filtering for search term (server-side would be better for large datasets)
    const filteredEvents = events.filter(event =>
        event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={`w-[240px] justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" onClick={handleExport} disabled={events.length === 0}>
                        <Download className="mr-2 h-4 w-4" /> Export Logs
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.length}</div>
                        <p className="text-xs text-muted-foreground">in current view</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {events.length > 0
                                ? Math.round((events.filter(e => e.status === 'success').length / events.length) * 100)
                                : 100}%
                        </div>
                        <p className="text-xs text-muted-foreground">Successful operations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Retention</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Immutable</div>
                        <p className="text-xs text-muted-foreground">Log retention</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
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
                        <SelectItem value="auth.login.success">Login Success</SelectItem>
                        <SelectItem value="auth.login.failed">Login Failed</SelectItem>
                        <SelectItem value="auth.register.success">Registration</SelectItem>
                        <SelectItem value="auth.logout">Logout</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="flex h-[400px] items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading audit events...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : filteredEvents.length === 0 ? (
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
                                    System activities will be logged here automatically. All events are immutable.
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
                                    <TableHead>User / IP</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Resource</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-medium text-xs">
                                            <div>{event.user_id ? event.user_id.substring(0, 8) + '...' : 'Anonymous'}</div>
                                            <div className="text-xs text-muted-foreground">{event.ip_address || 'N/A'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{event.action}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {event.resource_type && (
                                                <Badge variant="secondary" className="mr-1">{event.resource_type}</Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">{event.resource_id ? event.resource_id.substring(0, 8) + '...' : ''}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={event.status === 'success' ? 'default' : 'destructive'}>
                                                {event.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-md truncate text-xs font-mono text-muted-foreground">
                                            {event.details || '-'}
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
