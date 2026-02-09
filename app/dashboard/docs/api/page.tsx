"use client"

import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ApiPage() {
    return (
        <div className="space-y-8 pb-10 max-w-3xl">
            <div className="space-y-2">
                <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                    API Reference
                </h1>
                <p className="text-lg text-muted-foreground">
                    Complete reference documentation for the Piee REST API.
                </p>
            </div>

            <Separator />

            <section className="space-y-4">
                <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
                    Authentication
                </h2>
                <p className="leading-7 text-muted-foreground">
                    All API requests must be authenticated using a Bearer token. You can obtain your API key from the dashboard settings.
                </p>
                <div className="rounded-md bg-muted p-4">
                    <code className="text-sm font-mono">Authorization: Bearer YOUR_API_KEY</code>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
                    Endpoints
                </h2>

                <div className="space-y-4">
                    <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                        List Models
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono font-bold">GET</span>
                        <code className="text-sm font-mono text-muted-foreground">/v1/models</code>
                    </div>
                    <p className="leading-7 text-muted-foreground">
                        Retrieves a list of available AI models.
                    </p>

                    <Tabs defaultValue="curl" className="w-full">
                        <TabsList>
                            <TabsTrigger value="curl">cURL</TabsTrigger>
                            <TabsTrigger value="js">JavaScript</TabsTrigger>
                            <TabsTrigger value="python">Python</TabsTrigger>
                        </TabsList>
                        <TabsContent value="curl" className="rounded-md border bg-muted p-4 font-mono text-sm overflow-x-auto">
                            curl https://api.piee.app/v1/models \<br />
                            &nbsp;&nbsp;-H "Authorization: Bearer $PIEE_API_KEY"
                        </TabsContent>
                        <TabsContent value="js" className="rounded-md border bg-muted p-4 font-mono text-sm overflow-x-auto">
                            {`const response = await fetch('https://api.piee.app/v1/models', {
  headers: {
    'Authorization': \`Bearer \${process.env.PIEE_API_KEY}\`
  }
});
const data = await response.json();`}
                        </TabsContent>
                        <TabsContent value="python" className="rounded-md border bg-muted p-4 font-mono text-sm overflow-x-auto">
                            {`import requests
import os

response = requests.get(
    'https://api.piee.app/v1/models',
    headers={'Authorization': f'Bearer {os.getenv("PIEE_API_KEY")}'}
)
data = response.json()`}
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-4">
                    <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                        Generate Image
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono font-bold">POST</span>
                        <code className="text-sm font-mono text-muted-foreground">/v1/images/generate</code>
                    </div>
                    <p className="leading-7 text-muted-foreground">
                        Generates an image based on a text prompt.
                    </p>
                </div>
            </section>
        </div>
    )
}
