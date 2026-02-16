'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Plus, Settings } from "lucide-react"
import { APIClient, type Organization } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadOrganizations()
    }, [])

    const loadOrganizations = async () => {
        try {
            setLoading(true)
            // In production, fetch from /api/v1/organizations
            setOrganizations([])
        } catch (error) {
            console.error('Failed to load organizations:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Organization
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{organizations.length}</div>
                        <p className="text-xs text-muted-foreground">Active organizations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Across all orgs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Your Role</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Admin</div>
                        <p className="text-xs text-muted-foreground">In all organizations</p>
                    </CardContent>
                </Card>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="flex h-[400px] items-center justify-center">
                        <p className="text-muted-foreground">Loading organizations...</p>
                    </CardContent>
                </Card>
            ) : organizations.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Organizations</CardTitle>
                        <CardDescription>
                            Manage organization settings, members, and permissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
                            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                                <Building2 className="h-10 w-10 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No organizations found</h3>
                                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                    Create your first organization to start managing teams and resources.
                                </p>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Create Organization
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Organizations</CardTitle>
                        <CardDescription>
                            {organizations.length} organization{organizations.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Members</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {organizations.map((org) => (
                                    <TableRow key={org.id}>
                                        <TableCell className="font-medium">{org.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>0</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">Admin</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(org.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">
                                                Manage
                                            </Button>
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
