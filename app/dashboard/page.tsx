import FileBrowserWidget from "@/components/widgets/file-browser-widget";

export default function DashboardHome() {
  return (
    <div className="flex flex-col h-full w-full p-2 sm:p-4">
      <header className="mb-3 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-semibold tracking-tight">
          PIEE
        </h1>
        <p className="text-muted-foreground text-xs sm:text-base">
          Manage your creative tools, AI models, and automation workflows from one unified space.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Browser Widget */}
        <FileBrowserWidget />

        {/* Placeholder for more widgets */}
        <div className="border rounded-md bg-muted/30 p-4 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Add more widgets…</p>
        </div>
      </div>
    </div>
  );
}
