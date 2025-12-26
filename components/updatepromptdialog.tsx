"use client";

import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";

import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { OpenAPI } from "@/app/library/api";
import { useRouter } from "next/navigation";

import { MODEL_PRESETS } from "@/config/modelPresets";
import { CATEGORY_PRESETS } from "@/config/categoryPresets";
import { TAG_PRESETS } from "@/config/tagPresets";

type PromptType = "text" | "image" | "video";

type UpdatePromptDialogProps = {
  prompt: any;
};

export function UpdatePromptDialog({ prompt }: UpdatePromptDialogProps) {
  const [open, setOpen] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");

  const [type, setType] = useState<PromptType>("text");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [isPublic, setIsPublic] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  const hasMedia = Boolean(prompt?.media_url);

  // -----------------------------
  // Autofill values when opened
  // -----------------------------
  useEffect(() => {
    if (!prompt || !open) return;

    setTitle(prompt.title ?? "");
    setContent(prompt.content ?? "");
    setDescription(prompt.description ?? "");

    setType(prompt.type ?? "text");
    setModel(prompt.model ?? "");
    setCategory(prompt.category ?? "");

    setTags(Array.isArray(prompt.tags) ? prompt.tags : []);
    setIsPublic(Boolean(prompt.is_public));
    setTagInput("");
  }, [prompt, open]);


  function addTag(tag: string) {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || tags.includes(normalized)) return;
    setTags(prev => [...prev, normalized]);
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag));
  }


  // -----------------------------
  // Submit PATCH (partial update)
  // -----------------------------
  async function submit() {
    if (!user || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const token = await user.getIdToken();

      // Only send changed editable fields
      const payload: Record<string, any> = {};

      const safeCompare = (val: any, existing: any) =>
        JSON.stringify(val) !== JSON.stringify(existing);

      if (safeCompare(title, prompt.title)) payload.title = title;
      if (safeCompare(content, prompt.content)) payload.content = content;
      if (safeCompare(description, prompt.description)) payload.description = description;

      if (safeCompare(category, prompt.category)) payload.category = category;
      if (safeCompare(model, prompt.model)) payload.model = model;
      if (safeCompare(type, prompt.type)) payload.type = type;

      if (safeCompare(isPublic, prompt.is_public)) payload.is_public = isPublic;

      if (safeCompare(tags, prompt.tags)) payload.tags = tags.join(",");

      if (Object.keys(payload).length === 0) {
        toast.message("No changes to update");
        return;
      }

      const res = await fetch(`${OpenAPI.BASE}/library/prompts/${prompt.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Update failed");
      }

      toast.success("Prompt updated successfully ✨");

      // reset temp values
      setTagInput("");
      setIsSubmitting(false);
      setOpen(false);

      router.refresh();

    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(`Update failed — ${err.message}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="pointer-events-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
          />

          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Prompt content"
          />

          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Short description"
          />

          {/* Type */}
          <div className="space-y-2">
            {hasMedia && (
              <p className="text-xs text-muted-foreground">
                Media file already exists — backend does not allow replacing it.
                To change the file, delete & recreate the prompt.
              </p>
            )}
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label>Model</Label>

            <Input value={model} onChange={e => setModel(e.target.value)} />

            <Accordion type="single" collapsible>
              <AccordionItem value="models">
                <AccordionTrigger className="text-sm text-muted-foreground">
                  Choose preset
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {MODEL_PRESETS.map(m => (
                      <Button
                        key={m}
                        size="sm"
                        variant="outline"
                        onClick={() => setModel(m)}
                      >
                        {m}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>

            <Input value={category} onChange={e => setCategory(e.target.value)} />

            <Accordion type="single" collapsible>
              <AccordionItem value="categories">
                <AccordionTrigger className="text-sm text-muted-foreground">
                  Choose preset
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_PRESETS.map(c => (
                      <Button
                        key={c}
                        size="sm"
                        variant="outline"
                        onClick={() => setCategory(c)}
                      >
                        {c}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>

            <Input
              value={tagInput}
              placeholder="Type tag & press Enter"
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(tagInput);
                  setTagInput("");
                }
              }}
            />

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t} className="px-3 py-1 text-xs rounded-full border flex gap-1 items-center">
                    {t}
                    <button onClick={() => removeTag(t)}>×</button>
                  </span>
                ))}
              </div>
            )}

            <Accordion type="single" collapsible>
              <AccordionItem value="tags">
                <AccordionTrigger className="text-sm text-muted-foreground">
                  Choose preset
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {TAG_PRESETS.map(t => (
                      <Button
                        key={t}
                        size="sm"
                        variant="outline"
                        onClick={() => addTag(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Public prompt</Label>
              <p className="text-xs text-muted-foreground">
                Anyone can view & use this prompt
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <Button
            className="w-full"
            disabled={isSubmitting}
            onClick={submit}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Updating…" : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
