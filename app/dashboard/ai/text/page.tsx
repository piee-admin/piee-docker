export default function TextAIPage() {
  return (
    <div className="flex flex-col w-full h-auto min-h-[calc(100vh-6rem)] px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <header className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
          AI Text Generation
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
          Generate text, captions, and scripts using AI models.
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 border rounded-lg flex items-center justify-center bg-muted/20 p-3 sm:p-5 md:p-6">
        <p className="text-center text-sm sm:text-base text-muted-foreground">
          Text generator UI will appear here.
        </p>
      </div>
    </div>
  )
}
