'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollText, Plus, Eye, Clock, Code2, Play, Loader2 } from "lucide-react"
import { APIClient, apiClient, type Prompt, type PromptVersion } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PromptsPage() {
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [loading, setLoading] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
    const [orgId, setOrgId] = useState<string | null>(null)
    const [executing, setExecuting] = useState(false)
    const [executionResult, setExecutionResult] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            // 1. Get user's organization
            const orgs = await apiClient.organizations.list()
            if (orgs.length === 0) {
                setLoading(false)
                return
            }
            const oid = orgs[0].id
            setOrgId(oid)

            // 2. Fetch prompts for this org
            const data = await apiClient.prompts.list(oid)
            setPrompts(data)
        } catch (error) {
            console.error('Failed to load prompts:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadPrompts = async (oid: string) => {
        try {
            setLoading(true)
            const data = await apiClient.prompts.list(oid)
            setPrompts(data)
        } catch (error) {
            console.error('Failed to load prompts:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePrompt = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!orgId) return

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const description = formData.get('description') as string

        try {
            await apiClient.prompts.create(orgId, {
                name,
                description,
            })
            setCreateDialogOpen(false)
            loadPrompts(orgId)

            // If in onboarding, mark as complete
            try {
                const urlParams = new URLSearchParams(window.location.search)
                if (urlParams.get('onboarding') === 'true') {
                    await apiClient.onboarding.completeOnboarding()
                    window.location.href = '/dashboard/overview'
                }
            } catch (e) {
                console.error('Failed to complete onboarding', e)
            }
        } catch (error) {
            console.error('Failed to create prompt:', error)
        }
    }

    const handleRunPrompt = async () => {
        if (!selectedPrompt || !orgId) return
        setExecuting(true)
        setExecutionResult(null)
        try {
            const result = await apiClient.executions.create(orgId, selectedPrompt.id, { variables: {} })
            setExecutionResult(result.output_text)
        } catch (error: any) {
            console.error('Failed to execute prompt:', error)
            setExecutionResult(`Error: ${error.message || 'Execution failed'}`)
        } finally {
            setExecuting(false)
        }
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ScrollText className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">Prompts</h2>
                </div>

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Prompt
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleCreatePrompt}>
                            <DialogHeader>
                                <DialogTitle>Create New Prompt</DialogTitle>
                                <DialogDescription>
                                    Define a new versioned prompt template for your AI workflows.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Prompt Name</Label>
                                    <Input id="name" name="name" placeholder="e.g., Customer Support Response" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" placeholder="What does this prompt do?" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Prompt</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="flex h-[400px] items-center justify-center">
                        <p className="text-muted-foreground">Loading prompts...</p>
                    </CardContent>
                </Card>
            ) : prompts.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Prompt Infrastructure</CardTitle>
                        <CardDescription>
                            Manage and version your prompts as business logic.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
                            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                                <ScrollText className="h-10 w-10 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No prompts created</h3>
                                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                    You haven't created any prompts yet. Start by defining your first prompt template.
                                </p>
                                <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                                    Create your first prompt
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {prompts.map((prompt) => (
                        <Card key={prompt.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedPrompt(prompt)}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{prompt.name}</CardTitle>
                                    <Badge variant="outline">v{prompt.versions?.[0]?.version || 0}</Badge>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {prompt.description || 'No description'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(prompt.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Code2 className="h-3 w-3" />
                                        {prompt.versions?.length || 0} versions
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Prompt Detail Dialog */}
            {selectedPrompt && (
                <Dialog open={!!selectedPrompt} onOpenChange={() => { setSelectedPrompt(null); setExecutionResult(null); }}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedPrompt.name}</DialogTitle>
                            <DialogDescription>{selectedPrompt.description}</DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="latest">
                            <TabsList>
                                <TabsTrigger value="latest">Latest Version</TabsTrigger>
                                <TabsTrigger value="history">Version History</TabsTrigger>
                            </TabsList>

                            <TabsContent value="latest" className="space-y-4">
                                {selectedPrompt.versions && selectedPrompt.versions.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge>Version {selectedPrompt.versions[0].version}</Badge>
                                                <Button size="sm" onClick={handleRunPrompt} disabled={executing}>
                                                    {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
                                                    Run Latest
                                                </Button>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {selectedPrompt.versions[0].provider} / {selectedPrompt.versions[0].model}
                                            </div>
                                        </div>
                                        <div className="rounded-md bg-muted p-4">
                                            <pre className="text-sm whitespace-pre-wrap">{selectedPrompt.versions[0].content}</pre>
                                        </div>
                                        {executionResult && (
                                            <div className="rounded-md border p-4 mt-4 bg-background">
                                                <h4 className="text-sm font-medium mb-2">Execution Result:</h4>
                                                <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{executionResult}</pre>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No versions yet. Create the first version to get started.</p>
                                )}
                            </TabsContent>

                            <TabsContent value="history">
                                <div className="space-y-2">
                                    {selectedPrompt.versions?.map((version) => (
                                        <Card key={version.id}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-sm">Version {version.version}</CardTitle>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(version.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{version.content}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
