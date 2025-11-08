export default function OverviewPage() {
  return (
    <div className="flex flex-col h-full w-full p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Summary of your recent creative and automation activity.
        </p>
      </header>
      <div className="flex-1 border rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground">
        <p>Overview charts and stats will go here.</p>
      </div>
    </div>
  )
}
