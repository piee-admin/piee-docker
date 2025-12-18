"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { OpenAPI } from "@/app/library/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type PromptType = "text" | "image" | "video";
type PromptModel = "gpt-4o" | "gpt-4.1" | "gpt-4o-mini";

export function CreatePromptDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PromptType>("text");
  const [model, setModel] = useState<PromptModel>("gpt-4o");
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { user } = useAuth();

  // -----------------------------
  // Submit
  // -----------------------------
  async function submit(form: HTMLFormElement) {
    if (!user || isSubmitting) return;

    try {
      setIsSubmitting(true);

      toast.success("Creating prompt…");

      const formData = new FormData(form);
      formData.set("type", type);
      formData.set("model", model);
      formData.set("is_public", String(isPublic));

      if (type !== "text" && file) {
        formData.append("file", file);
      }

      const token = await user.getIdToken();

      const res = await fetch(`${OpenAPI.BASE}/library/prompts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Failed to create prompt");
      }

      toast.success("Prompt created 🎉.Your prompt has been successfully published");

      setOpen(false);
      setFile(null);
      form.reset();

      router.refresh();
    } catch (error: any) {
      toast.error(`Creation failed ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Reset file when switching to text
  useEffect(() => {
    if (type === "text") {
      setFile(null);
    }
  }, [type]);

  // -----------------------------
  // Drag & Drop
  // -----------------------------
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (type === "text") return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Create Prompt <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="pointer-events-auto">
        <DialogHeader>
          <DialogTitle>Create new prompt</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(e.currentTarget);
          }}
        >
          <Input name="title" placeholder="Title" required />
          <Textarea name="content" placeholder="Prompt content" required />
          <Textarea
            name="description"
            placeholder="Short description"
            required
          />

          {/* Type */}
          <div className="space-y-2">
            <Label>Prompt type</Label>
            <Select value={type} onValueChange={(v) => setType(v as PromptType)}>
              <SelectTrigger />
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label>Model</Label>
            <Select
              value={model}
              onValueChange={(v) => setModel(v as PromptModel)}
            >
              <SelectTrigger />
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Public */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-1">
              <Label>Public prompt</Label>
              <p className="text-xs text-muted-foreground">
                Anyone can view and use this prompt
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Upload */}
          {type !== "text" && (
            <div className="space-y-2">
              <Label>Reference file</Label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm transition hover:border-primary"
              >
                <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
                {file ? (
                  <p className="font-medium">{file.name}</p>
                ) : (
                  <p className="text-muted-foreground">
                    Drag & drop a file here
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "Creating…" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
