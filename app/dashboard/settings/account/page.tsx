export default function AccountSettingsPage() {
  return (
    <div className="flex flex-col h-full w-full p-2 sm:p-4">
      <header className="mb-3 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-semibold tracking-tight">
          Account
        </h1>
        <p className="text-muted-foreground text-xs sm:text-base">
          Manage your profile, email, password, and security.
        </p>
      </header>

      <div className="flex-1 border rounded-md sm:rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground p-2 sm:p-4">
        <p className="text-sm sm:text-base">Account settings UI will appear here.</p>
      </div>
    </div>
  )
}
