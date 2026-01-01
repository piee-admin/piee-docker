"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { library } from "@/app/library";
import { ExternalLink, Eye, Trash2 } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { CopyPromptButton } from "@/components/copypromptbutton";
import { SimpleTooltip } from "@/components/themed-tooltip";
import { OpenAPI } from "../../api";
import { LikeButton } from "@/components/likebutton";
import { openInModel } from "@/lib/openInModel";
import { Input } from "@/components/ui/input";
import { UpdatePromptDialog } from "@/components/updatepromptdialog";

type VariableGroup = Record<
  string,
  { key: string; full: string }[]
>;


/* -------------------------------------------
   Variable Extractor
------------------------------------------- */
function extractVariables(content: string): VariableGroup {

  const regex = /\$\{([^}]+)\}/g;
  const matches = [...content.matchAll(regex)];

  const groups: Record<
    string,
    { key: string; full: string }[]
  > = {};

  matches.forEach((m) => {
    const full = m[1]; // car.color OR animal

    if (full.includes(".")) {
      const [parent, child] = full.split(".");

      if (!groups[parent]) groups[parent] = [];
      groups[parent].push({ key: child, full });
    } else {
      if (!groups[full]) groups[full] = [];
      groups[full].push({ key: full, full });
    }
  });

  return groups;
}

type Props = {
  id: string;
};

export default function PromptPage({ id }: Props) {
  const viewFiredRef = useRef(false);
  const promptId = id;
  const { user } = useAuth();

  const [views, setViews] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // variable system state
  const [variables, setVariables] = useState<VariableGroup>({});

  const [filledContent, setFilledContent] = useState<string>("");


  /* -------------------------------------------
     Fetch prompt
  ------------------------------------------- */
  useEffect(() => {
    if (!promptId) return;

    async function fetchPrompt() {
      try {
        const data = await library.prompts.get(promptId as string);
        setPrompt(data);
      } catch {
        setPrompt(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPrompt();
  }, [promptId]);


  /* -------------------------------------------
     Extract variables from prompt content
  ------------------------------------------- */
  useEffect(() => {
    if (!prompt?.content) return;

    const grouped = extractVariables(prompt.content);
    setVariables(grouped);
    setFilledContent(prompt.content);
  }, [prompt]);


  /* -------------------------------------------
     Replace content when inputs change
  ------------------------------------------- */
  function handleVariableChange(fullKey: string, value: string) {
    setFilledContent((prev) => {
      const base = prompt.content as string;

      return base.replace(
        new RegExp(`\\$\\{${fullKey}\\}`, "g"),
        value || ""
      );
    });
  }


  /* -------------------------------------------
     View Tracking
  ------------------------------------------- */
  useEffect(() => {
    if (!promptId || viewFiredRef.current) return;

    fetch(`${OpenAPI.BASE}/library/interactions/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resource_id: promptId,
        resource_type: "prompt",
      }),
    }).catch(() => { });

    viewFiredRef.current = true;
  }, [promptId]);


  useEffect(() => {
    if (!promptId) return;

    fetch(
      `${OpenAPI.BASE}/library/interactions/views/count?resource_id=${promptId}&resource_type=prompt`
    )
      .then((res) => res.json())
      .then((data) => setViews(data.views ?? 0))
      .catch(() => setViews(0));
  }, [promptId]);


  /* -------------------------------------------
     Skeleton Loading UI
  ------------------------------------------- */
  if (loading) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-6 py-12 max-w-4xl space-y-10"
      >
        <div className="space-y-4">
          <Skeleton className="h-[320px] w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Separator />

        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </motion.main>
    );
  }


  /* -------------------------------------------
     Prompt not found
  ------------------------------------------- */
  if (!prompt?.id) {
    const router = useRouter();

    return (
      <div className="container mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-semibold">Prompt not found</h2>

        <p className="text-muted-foreground">
          The prompt exists but failed to load. Try reloading.
        </p>

        <div className="flex justify-center gap-3 pt-4">
          <Button variant="default" onClick={() => router.refresh()}>
            Reload
          </Button>

          <Button variant="outline" asChild>
            <Link href="/library">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }


  const title =
    prompt.title ??
    String(prompt.content ?? "").slice(0, 60) ??
    "Untitled Prompt";

  const createdAt = prompt.created_at;
  const isOwner =
    user?.uid && prompt?.author_id && user.uid === prompt.author_id;
  const isMedia = Boolean(prompt.thumbnail_url);


  async function deletePrompt() {
    if (!user || !prompt?.id) return;

    try {
      setIsDeleting(true);
      const token = await user.getIdToken();

      const res = await fetch(
        `${OpenAPI.BASE}/library/prompts/${prompt.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to delete prompt");

      toast.success("Prompt deleted");
      window.location.href = "/library";
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }


  /* -------------------------------------------
     Page
  ------------------------------------------- */
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="container mx-auto px-6 py-12 max-w-4xl space-y-10"
    >
      {/* ---------------- FIRST CARD ---------------- */}
      <Card>
        <CardHeader className="space-y-4">
          {isMedia ? (
            <div className="overflow-hidden rounded-md">
              {prompt.type === "image" && (
                <Image
                  src={prompt.media_url ?? prompt.thumbnail_url}
                  alt={title}
                  width={1200}
                  height={675}
                  className="w-full object-cover"
                  priority
                />
              )}

              {prompt.type === "video" && (
                <video
                  src={prompt.media_url}
                  poster={prompt.thumbnail_url}
                  controls
                  className="w-full rounded-md"
                />
              )}
            </div>
          ) : (
            <div className="aspect-[4/5] flex items-center justify-center p-10 text-center rounded-md bg-muted">
              <h2 className="text-2xl font-semibold">{title}</h2>
            </div>
          )}

          <CardTitle className="text-2xl font-semibold">
            {title}
          </CardTitle>

          <div className="flex flex-wrap gap-2">
            {prompt.model && (
              <SimpleTooltip label="AI Model">
                <Badge variant="secondary">{prompt.model}</Badge>
              </SimpleTooltip>
            )}
            {prompt.type && (
              <SimpleTooltip label="Prompt Type">
                <Badge variant="outline">{prompt.type}</Badge>
              </SimpleTooltip>
            )}
            {prompt.category && (
              <SimpleTooltip label="Category">
                <Badge variant="outline">{prompt.category}</Badge>
              </SimpleTooltip>
            )}
            <SimpleTooltip label="Like">
              <LikeButton resourceId={promptId!} />
            </SimpleTooltip>

          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            {views !== null && (
              <p className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {views.toLocaleString()} views
              </p>
            )}

            {createdAt && (
              <p>
                Created{" "}
                {formatDistanceToNowStrict(new Date(createdAt))} ago
              </p>
            )}
          </div>
        </CardHeader>
      </Card>


      <Separator />


      {/* ---------------- VARIABLE INPUTS CARD ---------------- */}
      {Object.keys(variables).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variables</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter values to personalize this prompt before copying or opening it.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">

            {Object.entries(variables).map(([group, fields]) => (
              <div
                key={group}
                className="rounded-xl border bg-muted/40 p-4 space-y-4"
              >
                {/* Show parent label only when object-like vars exist (car.color) */}
                {fields.some(f => f.key !== group) ? (
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold capitalize">
                      {group}
                    </h3>

                    <Badge variant="secondary" className="uppercase">
                      Group
                    </Badge>
                  </div>
                ) : (
                  <h3 className="font-medium capitalize">
                    {group}
                  </h3>
                )}

                <Separator />

                <div className="grid gap-4">
                  {fields.map((f) => (
                    <div
                      key={f.full}
                      className="grid gap-2"
                    >
                      <label className="text-xs font-medium text-muted-foreground capitalize">
                        {fields.length > 1 && f.key !== group
                          ? `${group}.${f.key}`
                          : f.key}
                      </label>

                      <Input
                        placeholder={`Enter ${f.key}`}
                        className="bg-background"
                        onChange={(e) =>
                          handleVariableChange(f.full, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

          </CardContent>
        </Card>
      )}



      {/* ---------------- PROMPT PREVIEW CARD ---------------- */}
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <SimpleTooltip label="If not auto-pasted, the prompt is copied—just paste it.">
            <Button
              onClick={() =>
                openInModel(
                  prompt.model,
                  String(filledContent || prompt.content)
                )
              }
              variant="outline"
              size="sm"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in {prompt.model}
            </Button>
          </SimpleTooltip>

          <div className="flex gap-2">
            {isOwner && (
              <SimpleTooltip label="Edit">
                <UpdatePromptDialog prompt={prompt} />
              </SimpleTooltip>
            )}

            {isOwner && (
              <SimpleTooltip label="Delete">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </SimpleTooltip>
            )}
            <SimpleTooltip label="Copy">
              <CopyPromptButton content={String(filledContent)} />
            </SimpleTooltip>

          </div>
        </CardHeader>

        <CardContent className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {filledContent}
          </pre>
        </CardContent>
      </Card>


      {/* ---------------- DELETE DIALOG ---------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete prompt?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={deletePrompt}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.main>
  );
}
