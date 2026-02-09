"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Laptop, Lock, Zap } from "lucide-react"
import Link from "next/link"

export default function IntroPage() {
    return (
        <div className="space-y-10 pb-10 max-w-3xl">
            {/* Hero Header */}
            <div className="space-y-4">
                <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
                    Introduction
                </h1>
                <p className="text-xl text-muted-foreground leading-8">
                    Piee is the universal creative command palette. Compress images, trim videos, and format code with a single shortcut — instantly, locally, and open-source.
                </p>
                <div className="flex items-center gap-4 pt-4">
                    <Link href="/dashboard/docs/get-started">
                        <Button size="lg">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Button variant="outline" size="lg">
                        View on GitHub
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Features Grid */}
            <section className="space-y-4">
                <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    Why Piee?
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
                    <Card>
                        <CardHeader>
                            <Zap className="w-8 h-8 mb-2 text-primary" />
                            <CardTitle>Lightning Fast</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Built on Rust and optimized for local execution. No cloud latency.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Lock className="w-8 h-8 mb-2 text-primary" />
                            <CardTitle>Privacy First</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Your files never leave your device. All processing happens locally.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Laptop className="w-8 h-8 mb-2 text-primary" />
                            <CardTitle>Universal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Works on macOS, Windows, and Linux with a consistent experience.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Philosophy */}
            <section className="space-y-4">
                <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    Philosophy
                </h2>
                <p className="leading-7 text-muted-foreground">
                    We believe creative tools should be accessible, fast, and respectful of your privacy. Piee consolidates fragmented utilities into a single, cohesive interface that gets out of your way.
                </p>
            </section>
        </div>
    )
}
