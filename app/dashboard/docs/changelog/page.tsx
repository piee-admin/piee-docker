"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ChangelogPage() {
    return (
        <div className="space-y-8 pb-10 max-w-3xl">
            <div className="space-y-2">
                <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                    Changelog
                </h1>
                <p className="text-lg text-muted-foreground">
                    Latest updates and improvements to Piee.
                </p>
            </div>

            <Separator />

            <section className="space-y-8">
                {/* v1.2.0 */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            v1.2.0
                        </h2>
                        <span className="text-sm text-muted-foreground">February 14, 2024</span>
                    </div>
                    <p className="leading-7 text-muted-foreground">
                        Introduced new AI-powered image generation capabilities.
                    </p>
                    <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                        <li>
                            <Badge variant="default" className="mr-2">New</Badge>
                            Added <code className="text-sm font-mono text-foreground">generate-image</code> command to CLI.
                        </li>
                        <li>
                            <Badge variant="secondary" className="mr-2">Improvement</Badge>
                            Optimized local caching for model weights.
                        </li>
                        <li>
                            <Badge variant="outline" className="mr-2">Fix</Badge>
                            Fixed an issue with image path resolution on Windows.
                        </li>
                    </ul>
                </div>

                <Separator />

                {/* v1.1.0 */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            v1.1.0
                        </h2>
                        <span className="text-sm text-muted-foreground">January 30, 2024</span>
                    </div>
                    <p className="leading-7 text-muted-foreground">
                        Major performance improvements and new video tools.
                    </p>
                    <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                        <li>
                            <Badge variant="default" className="mr-2">New</Badge>
                            Video trimming and transcoding support.
                        </li>
                        <li>
                            <Badge variant="secondary" className="mr-2">Improvement</Badge>
                            Reduced binary size by 40%.
                        </li>
                    </ul>
                </div>

                <Separator />

                {/* v1.0.0 */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            v1.0.0
                        </h2>
                        <span className="text-sm text-muted-foreground">January 1, 2024</span>
                    </div>
                    <p className="leading-7 text-muted-foreground">
                        Initial release of Piee.
                    </p>
                    <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                        <li>
                            <Badge variant="default" className="mr-2">New</Badge>
                            Core CLI functionality.
                        </li>
                        <li>
                            <Badge variant="default" className="mr-2">New</Badge>
                            Image compression tools.
                        </li>
                        <li>
                            <Badge variant="default" className="mr-2">New</Badge>
                            Code formatter integration.
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    )
}
