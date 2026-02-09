"use client"

import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function CliPage() {
    return (
        <div className="space-y-8 pb-10 max-w-3xl">
            <div className="space-y-2">
                <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                    CLI Reference
                </h1>
                <p className="text-lg text-muted-foreground">
                    Command line interface documentation for piee-cli.
                </p>
            </div>

            <Separator />

            <section className="space-y-4">
                <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
                    Commands
                </h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Command</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Usage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-mono font-medium">init</TableCell>
                            <TableCell>Initialize a new Piee project configuration.</TableCell>
                            <TableCell className="font-mono text-muted-foreground">piee init</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-mono font-medium">add</TableCell>
                            <TableCell>Add a new component or integration to your project.</TableCell>
                            <TableCell className="font-mono text-muted-foreground">piee add [component]</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-mono font-medium">login</TableCell>
                            <TableCell>Authenticate via the command line.</TableCell>
                            <TableCell className="font-mono text-muted-foreground">piee login</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-mono font-medium">status</TableCell>
                            <TableCell>Check the status of Piee services.</TableCell>
                            <TableCell className="font-mono text-muted-foreground">piee status</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-mono font-medium">version</TableCell>
                            <TableCell>Get the current CLI version.</TableCell>
                            <TableCell className="font-mono text-muted-foreground">piee version</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>

            <section className="space-y-4">
                <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
                    Global Flags
                </h2>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                    <li><code className="text-sm font-mono text-foreground">--help, -h</code> : Show help for command.</li>
                    <li><code className="text-sm font-mono text-foreground">--verbose</code> : Enable verbose logging.</li>
                    <li><code className="text-sm font-mono text-foreground">--json</code> : Output result as JSON.</li>
                </ul>
            </section>
        </div>
    )
}
