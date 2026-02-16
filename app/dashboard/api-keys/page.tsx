'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function APIKeysPage() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Code className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create API Key
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Developer Access</CardTitle>
                    <CardDescription>
                        Secure keys for programatic prompt execution.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[200px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <p className="text-sm text-muted-foreground">No API keys active.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
