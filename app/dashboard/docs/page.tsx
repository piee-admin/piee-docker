"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { navMain } from "@/config/nav"

export default function DocsPage() {
    // Find the Documentation section from the config
    const docsConfig = navMain.find(item => item.title === "Documentation")?.items || []

    return (
        <div className="flex h-full w-full gap-6 lg:gap-10">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
                <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                    <div className="space-y-6">
                        <div>
                            <h4 className="mb-2 text-sm font-semibold tracking-tight">
                                Documentation
                            </h4>
                            <div className="grid grid-flow-row auto-rows-max text-sm gap-1">
                                {docsConfig.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.url}
                                        className="group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 hover:bg-muted hover:text-foreground text-muted-foreground"
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Content */}
            <div className="flex-1 py-6 lg:py-8 min-w-0">
                <div className="space-y-10 pb-10 max-w-3xl">

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                            Documentation
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Everything you need to know about building with Piee.
                        </p>
                    </div>

                    <Separator />

                    {/* Dynamic Sections based on Config */}
                    {docsConfig.map((item, index) => (
                        <section key={index} id={item.url.split('/').pop()} className="space-y-4">
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                                {item.title}
                            </h2>
                            <p className="leading-7 text-muted-foreground">
                                Content for {item.title} will go here.
                            </p>
                            {item.title === "Introduction" && (
                                <>
                                    <p className="leading-7 [&:not(:first-child)]:mt-6">
                                        Piee is a universal creative command palette designed to streamline your workflow.
                                        Whether you are compressing images, trimming videos, or formatting code, Piee handles it all locally and efficiently.
                                    </p>
                                    <div className="flex items-center space-x-2 pt-4">
                                        <Button>
                                            Get Started
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                        <Button variant="outline">View on GitHub</Button>
                                    </div>
                                </>
                            )}
                            {item.title === "Quick Start" && (
                                <div className="relative rounded-lg border bg-muted px-4 py-3 font-mono text-sm">
                                    <code>npm install piee-cli</code>
                                </div>
                            )}
                        </section>
                    ))}

                </div>
            </div>
        </div>
    )
}
