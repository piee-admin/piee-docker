export default function ActivityPage() {
  return (
    <div className="flex flex-col h-full w-full p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Activity</h1>
        <p className="text-muted-foreground">Track recent tool and AI usage.</p>
      </header>
      <div className="flex-1 border rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground">
        <p>Recent activities and logs will be displayed here.</p>
      </div>
    </div>
  )
}
