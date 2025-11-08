"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import Login from "@/components/Login"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Hidden but accessible title */}
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Login</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        {/* Your actual login UI */}
        <Login onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
