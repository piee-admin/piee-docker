"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export function CopyPromptButton({ content }: { content?: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        if (!content) {
          toast.error("Nothing to copy");
          return;
        }

        navigator.clipboard.writeText(content);
        toast.success("Prompt copied to clipboard");
      }}
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
}
