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
import { Plus } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { OpenAPI } from "@/app/library/api";
import { library } from "@/app/library";

type PromptType = "text" | "image" | "video";
type PromptModel = "gpt-4o" | "gpt-4.1" | "gpt-4o-mini";

export function CreatePromptDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PromptType>("text");
  const [model, setModel] = useState<PromptModel>("gpt-4o");
  const [isPublic, setIsPublic] = useState(true);
  const [fileName, setFileName] = useState("");
  const { user } = useAuth();

  async function submit(form: HTMLFormElement) {
    if (!user) return;

    const formData = new FormData(form);
    formData.set("type", type);
    formData.set("model", model);
    formData.set("is_public", String(isPublic));

    if (type === "text") {
      formData.delete("file");
    }

    OpenAPI.TOKEN = await user.getIdToken();
    await library.prompts.create({ body: formData });

    setOpen(false);
  }

  // Reset file when switching to text
  useEffect(() => {
    if (type === "text") {
      const input = document.getElementById("prompt-file") as HTMLInputElement;
      if (input) input.value = "";
      setFileName("");
    }
  }, [type]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Create Prompt <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>

      {/* 🔥 pointer-events fix */}
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

          <Textarea
            name="content"
            placeholder="Prompt content"
            required
          />

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
            <Select value={model} onValueChange={(v) => setModel(v as PromptModel)}>
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

          {/* File upload (GUARANTEED WORKING) */}
          <div className="space-y-2">
            <Label>Upload file</Label>

            <Input
              type="file"
              name="file"
              disabled={type === "text"}
              required={type !== "text"}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
          </div>

          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
