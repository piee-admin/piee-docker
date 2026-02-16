'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Key, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { APIClient, type ProviderKey } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProvidersPage() {
    const [keys, setKeys] = useState<ProviderKey[]>([])
    const [loading, setLoading] = useState(true)
    const [addDialogOpen, setAddDialogOpen] = useState(false)

    const orgId = "default-org"

    useEffect(() => {
        loadKeys()
    }, [])

    const loadKeys = async () => {
        try {
            setLoading(true)
            const data = await APIClient.get<ProviderKey[]>(`/api/v1/provider-keys/${orgId}`)
            setKeys(data)
        } catch (error) {
            console.error('Failed to load provider keys:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddKey = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        try {
            await APIClient.post(`/api/v1/provider-keys/${orgId}`, {
                provider: formData.get('provider'),
                key_name: formData.get('key_name'),
                api_key: formData.get('api_key'),
            })
            setAddDialogOpen(false)
            setAddDialogOpen(false)
            loadKeys()

            // If in onboarding (query param check or just always update progress)
            try {
                // Check if we should update onboarding
                const urlParams = new URLSearchParams(window.location.search)
                if (urlParams.get('onboarding') === 'true') {
                    // Update step
                    await fetch('/api/v1/onboarding/update-step', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('piee_token') || localStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify({ step: 3 })
                    })

                    // Redirect back to onboarding
                    window.location.href = '/onboarding'
                }
            } catch (e) {
                console.error('Failed to update onboarding step', e)
            }
        } catch (error: any) {
            alert(error.message || 'Failed to add provider key')
        }
    }

    const handleDeleteKey = async (keyId: string) => {
        if (!confirm('Are you sure you want to delete this API key?')) return

        try {
            await APIClient.delete(`/api/v1/provider-keys/${orgId}/${keyId}`)
            loadKeys()
        } catch (error) {
            console.error('Failed to delete key:', error)
        }
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Key className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">Provider API Keys (BYOK)</h2>
                </div>

                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Provider Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleAddKey}>
                            <DialogHeader>
                                <DialogTitle>Add Provider API Key</DialogTitle>
                                <DialogDescription>
                                    Securely store your API key for AI provider access. Keys are encrypted at rest.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="provider">Provider</Label>
                                    <Select name="provider" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="openai">OpenAI</SelectItem>
                                            <SelectItem value="anthropic">Anthropic</SelectItem>
                                            <SelectItem value="google">Google AI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="key_name">Key Name</Label>
                                    <Input id="key_name" name="key_name" placeholder="e.g., Production OpenAI Key" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="api_key">API Key</Label>
                                    <Input id="api_key" name="api_key" type="password" placeholder="sk-..." required />
                                    <p className="text-xs text-muted-foreground">
                                        Your key is encrypted before storage and never shown again.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Add Key</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Alert>
                <AlertDescription>
                    <strong>Bring Your Own Key (BYOK):</strong> Your API keys are encrypted using AES-256 and stored securely.
                    PIEE never sees or logs your actual keys - they're only decrypted in-memory during AI calls.
                </AlertDescription>
            </Alert>

            {loading ? (
                <Card>
                    <CardContent className="flex h-[200px] items-center justify-center">
                        <p className="text-muted-foreground">Loading provider keys...</p>
                    </CardContent>
                </Card>
            ) : keys.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Provider Keys</CardTitle>
                        <CardDescription>
                            Add your first API key to start using AI providers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                            <Button onClick={() => setAddDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Your First Key
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {keys.map((key) => (
                        <Card key={key.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {key.key_name}
                                            {key.is_active ? (
                                                <Badge variant="outline" className="gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="gap-1">
                                                    <XCircle className="h-3 w-3" /> Inactive
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="capitalize">{key.provider}</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(key.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Key Prefix:</span>
                                        <code className="text-xs bg-muted px-2 py-1 rounded">{key.key_prefix}...</code>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Added:</span>
                                        <span>{new Date(key.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {key.last_used_at && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Used:</span>
                                            <span>{new Date(key.last_used_at).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
