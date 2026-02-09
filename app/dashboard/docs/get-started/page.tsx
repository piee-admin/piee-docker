"use client"

import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export default function GetStartedPage() {
    return (
        <div className="space-y-8 pb-10 max-w-3xl">
            <div className="space-y-2">
                <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                    Getting Started
                </h1>
                <p className="text-lg text-muted-foreground">
                    Install and configure Piee on your machine.
                </p>
            </div>

            <Separator />

            <section className="space-y-4">
                <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
                    Prerequisites
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Piee requires Node.js 18.0.0 or later.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
                    Installation
                </h2>
                <p className="leading-7 text-muted-foreground">
                    You can install the Piee CLI globally using your preferred package manager.
                </p>

                <div className="relative rounded-lg border bg-zinc-950 text-zinc-50 dark:bg-zinc-900 px-4 py-4 font-mono text-sm">
                    <div className="flex items-center gap-2 mb-2 text-zinc-500">
                        <Terminal className="w-4 h-4" />
                        <span>Terminal</span>
                    </div>
                    <div className="grid gap-2">
                        <code>npm install -g @piee/cli</code>
                        <span className="text-zinc-500"># or</span>
                        <code>pnpm add -g @piee/cli</code>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
                    Initialization
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Once installed, initialize Piee in your project directory.
                </p>
                <div className="relative rounded-lg border bg-zinc-950 text-zinc-50 dark:bg-zinc-900 px-4 py-4 font-mono text-sm">
                    <code>piee init</code>
                </div>
                <p className="leading-7 text-muted-foreground">
                    This will create a <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">piee.config.json</code> file in your root directory.
                </p>
            </section>

            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Tip</AlertTitle>
                <AlertDescription>
                    You can also use <code className="font-mono text-xs">npx @piee/cli init</code> to run without installing globally.
                </AlertDescription>
            </Alert>
        </div>
    )
}
