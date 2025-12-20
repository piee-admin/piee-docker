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
  SelectValue
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { OpenAPI } from "@/app/library/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type PromptType = "text" | "image" | "video";
/*type PromptModel = "gpt-4o" | "gpt-4.1" | "gpt-4o-mini";
type PromptCategory =
  | "architecture"
  | "design"
  | "marketing"
  | "coding"
  | "general";


const MODEL_PRESETS = ["gpt-4o", "gpt-4.1", "gpt-4o-mini"];
const CATEGORY_PRESETS = [
  "general",
  "architecture",
  "design",
  "marketing",
  "coding",
];
*/


const MODEL_PRESETS = [
  // OpenAI
  "gpt-4o",
  "gpt-4.1",
  "gpt-4o-mini",
  "gpt-4-turbo",

  // Anthropic
  "claude-3-opus",
  "claude-3-sonnet",
  "claude-3-haiku",

  // Google
  "gemini-1.5-pro",
  "gemini-1.5-flash",

  // Meta / OSS
  "llama-3-70b",
  "llama-3-8b",
  "mistral-large",
  "mixtral-8x7b",

  // Image / Video
  "dall-e-3",
  "midjourney",
  "sdxl",
  "runway-gen3",
  "pika",

  // Audio
  "whisper",
  "elevenlabs",
  "playht",

  // Custom / Infra
  "custom-llm",
  "local-ollama",
  "api-only-model",
];



const CATEGORY_PRESETS = [
  // General
  "general",
  "productivity",
  "brainstorming",

  // Design & Creative
  "architecture",
  "interior-design",
  "graphic-design",
  "ui-ux",
  "branding",
  "motion-design",
  "3d",
  "vfx",
  "photography",
  "videography",

  // Tech
  "coding",
  "frontend",
  "backend",
  "fullstack",
  "devops",
  "database",
  "cloud",
  "ai-ml",
  "data-science",

  // Business
  "marketing",
  "growth",
  "seo",
  "copywriting",
  "sales",
  "startup",
  "saas",
  "product-management",

  // Writing
  "content-writing",
  "technical-writing",
  "documentation",
  "storytelling",
  "screenwriting",

  // Media specific
  "image-generation",
  "video-generation",
  "audio-generation",
  "music",

  // Education / Niche
  "education",
  "research",
  "legal",
  "finance",
  "healthcare",
];

const TAG_PRESETS = [
  // Creative
  "ui",
  "ux",
  "branding",
  "logo",
  "typography",
  "illustration",
  "3d",
  "vfx",
  "motion",
  "animation",

  // Tech
  "react",
  "nextjs",
  "nodejs",
  "python",
  "fastapi",
  "database",
  "api",
  "cloud",
  "ai",
  "ml",

  // Business
  "marketing",
  "seo",
  "copywriting",
  "growth",
  "sales",
  "startup",
  "saas",
  "product",

  // Media
  "image",
  "video",
  "audio",
  "voice",
  "music",

  // General
  "prompt-engineering",
  "automation",
  "workflow",
  "productivity",
];



export function CreatePromptDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PromptType>("text");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelAccordionOpen, setModelAccordionOpen] = useState<string>("");
  const [categoryAccordionOpen, setCategoryAccordionOpen] = useState<string>("");

  const requiresFile = type === "image" || type === "video";

  const isFormValid =
    Boolean(model.trim()) &&
    Boolean(category.trim()) &&
    (!requiresFile || Boolean(file));

  const router = useRouter();

  const { user } = useAuth();

  function addTag(tag: string) {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || tags.includes(normalized)) return;

    setTags((prev) => [...prev, normalized]);
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }


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
      formData.set("category", category);
      formData.set("tags", tags.join(","));
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
              <SelectTrigger>
                <SelectValue placeholder="Select prompt type" />
              </SelectTrigger>
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

            <Input
              name="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. gpt-4o, claude-3, custom-llm"
            />

            <Accordion
              type="single"
              collapsible
              value={modelAccordionOpen}
              onValueChange={setModelAccordionOpen}
            >
              <AccordionItem value="models">
                <AccordionTrigger className="text-sm text-muted-foreground">
                  More models
                </AccordionTrigger>

                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {MODEL_PRESETS.map((m) => (
                      <Button
                        key={m}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground border-muted hover:text-foreground"
                        onClick={() => {
                          setModel(m);
                          setModelAccordionOpen(""); // ✅ CLOSE CORRECTLY
                        }}
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

            <Input
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. architecture, ui-ux, ai-ml"
            />

            <Accordion
              type="single"
              collapsible
              value={categoryAccordionOpen}
              onValueChange={setCategoryAccordionOpen}
            >
              <AccordionItem value="categories">
                <AccordionTrigger className="text-sm text-muted-foreground">
                  More categories
                </AccordionTrigger>

                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_PRESETS.map((c) => (
                      <Button
                        key={c}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground border-muted hover:text-foreground"
                        onClick={() => {
                          setCategory(c);
                          setCategoryAccordionOpen(""); // ✅ CLOSE
                        }}
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

            {/* Input */}
            <Input
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(tagInput);
                  setTagInput("");
                }
              }}
            />

            {/* Selected tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Accordion presets */}
            <Accordion type="single" collapsible>
              <AccordionItem value="tags">
                <AccordionTrigger className="text-sm text-muted-foreground">
                  More tags
                </AccordionTrigger>

                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {TAG_PRESETS.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground border-muted hover:text-foreground"
                        onClick={() => addTag(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
          {requiresFile && !file && (
            <p className="text-xs text-destructive">
              Reference file is required for image or video prompts
            </p>
          )}


          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !isFormValid}
          >
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
