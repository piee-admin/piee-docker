export default function CaptionGenerator() {
  return (
    <div className="flex flex-col h-full w-full p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Caption Generator</h1>
        <p className="text-muted-foreground">Trim, merge, and normalize audio clips.</p>
      </header>
      <div className="flex-1 border rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground">
        <p>Audio editing utilities will appear here.</p>
      </div>
    </div>
  )
}
