"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export function CopyPromptButton({ content }: { content: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        if (!content) {
          toast.error("Nothing to copy");
          return;
        }

        try {
          // ensure browser environment
          if (typeof navigator === "undefined") {
            throw new Error("Clipboard unavailable");
          }

          // preferred clipboard API
          if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(content);
          } else {
            // fallback: legacy execCommand
            const textarea = document.createElement("textarea");
            textarea.value = content;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
          }

          toast.success("Prompt copied to clipboard");
        } catch (err) {
          console.error(err);
          toast.error("Copy failed — please copy manually");
        }
      }}

    >
      <Copy className="h-4 w-4" />
    </Button>
  );
}
