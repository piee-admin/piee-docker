"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNowStrict } from "date-fns";

import { library } from "@/app/library";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import { OpenAPI } from "../../api";

import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

import { LikeButton } from "@/components/likebutton";
import { CopyPromptButton } from "@/components/copypromptbutton";
import { SimpleTooltip } from "@/components/themed-tooltip";
import { UpdatePromptDialog } from "@/components/updatepromptdialog";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";

import { Eye, Trash2, ExternalLink } from "lucide-react";
import { openInModel } from "@/lib/openInModel";


/* ---------------- Helpers ---------------- */

type VariableGroup = Record<
  string,
  { key: string; full: string }[]
>;

function extractVariables(content: string): VariableGroup {
  const regex = /\$\{([^}]+)\}/g;
  const matches = [...content.matchAll(regex)];
  const groups: VariableGroup = {};

  matches.forEach((m) => {
    const full = m[1];
    if (full.includes(".")) {
      const [parent, child] = full.split(".");
      (groups[parent] ??= []).push({ key: child, full });
    } else {
      (groups[full] ??= []).push({ key: full, full });
    }
  });

  return groups;
}


/* ---------------- Props ---------------- */

type PromptPageProps = {
  id: string;
  prompt?: any;     // server-loaded prompt
};


/* =====================================================
   PROMPT PAGE — server prompt first, fallback fetch
===================================================== */

export default function PromptPage({ id, prompt: serverPrompt }: PromptPageProps) {
  const router = useRouter();
  const { user } = useAuth();

  const promptId = id;

  // Use server prompt as initial value
  const [prompt, setPrompt] = useState<any>(serverPrompt ?? null);
  const [loading, setLoading] = useState(!serverPrompt);

  const [views, setViews] = useState<number | null>(null);

  const [variables, setVariables] = useState<VariableGroup>({});
  const [filledContent, setFilledContent] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const viewFiredRef = useRef(false);


  /* ---------------------------------------------------
     Fetch ONLY if server did not supply prompt
  --------------------------------------------------- */
  useEffect(() => {
    if (serverPrompt || !promptId) return;

    async function fetchPrompt() {
      try {
        const data = await library.prompts.get(promptId);
        setPrompt(data);
      } catch {
        setPrompt(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPrompt();
  }, [promptId, serverPrompt]);


  /* ---------------------------------------------------
     Extract variables
  --------------------------------------------------- */
  useEffect(() => {
    if (!prompt?.content) return;

    const grouped = extractVariables(prompt.content);
    setVariables(grouped);
    setFilledContent(prompt.content);
  }, [prompt]);


  function handleVariableChange(fullKey: string, value: string) {
    if (!prompt?.content) return;

    setFilledContent(
      prompt.content.replace(
        new RegExp(`\\$\\{${fullKey}\\}`, "g"),
        value || ""
      )
    );
  }


  /* ---------------------------------------------------
     View tracking — fire once
  --------------------------------------------------- */
  useEffect(() => {
    if (!promptId || viewFiredRef.current) return;

    fetch(`${OpenAPI.BASE}/library/interactions/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resource_id: promptId,
        resource_type: "prompt",
      }),
    }).catch(() => {});

    viewFiredRef.current = true;
  }, [promptId]);


  /* ---------------------------------------------------
     Fetch view count
  --------------------------------------------------- */
  useEffect(() => {
    if (!promptId) return;

    fetch(
      `${OpenAPI.BASE}/library/interactions/views/count?resource_id=${promptId}&resource_type=prompt`
    )
      .then((r) => r.json())
      .then((d) => setViews(d.views ?? 0))
      .catch(() => setViews(0));
  }, [promptId]);


  /* ---------------------------------------------------
     Skeleton
  --------------------------------------------------- */
  if (loading) {
    return (
      <motion.main className="container mx-auto px-6 py-12 max-w-4xl space-y-10">
        <Skeleton className="h-[320px] w-full rounded-lg" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-64" />
      </motion.main>
    );
  }


  /* ---------------------------------------------------
     Not found
  --------------------------------------------------- */
  if (!prompt?.id) {
    return (
      <div className="container mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-semibold">Prompt not found</h2>

        <Button onClick={() => router.refresh()}>Reload</Button>

        <Button variant="outline" asChild>
          <Link href="/library">Go Back</Link>
        </Button>
      </div>
    );
  }


  /* ---------------------------------------------------
     Derived values
  --------------------------------------------------- */
  const title =
    prompt.title ??
    String(prompt.content ?? "").slice(0, 60) ??
    "Untitled Prompt";

  const createdAt = prompt.created_at;
  const isOwner =
    user?.uid && prompt?.author_id && user.uid === prompt.author_id;

  const isMedia = Boolean(prompt.thumbnail_url);


  /* ---------------------------------------------------
     Delete prompt
  --------------------------------------------------- */
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


  /* ====================================================
     PAGE
  ==================================================== */
  return (
    <motion.main className="container mx-auto px-6 py-12 max-w-4xl space-y-10">

      {/* ---------------- FIRST CARD (RESTORED) ---------------- */}
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


      {/* ---------------- VARIABLES CARD (unchanged) ---------------- */}
      {Object.keys(variables).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variables</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {Object.entries(variables).map(([group, fields]) => (
              <div key={group} className="grid gap-4">
                {fields.map((f) => (
                  <Input
                    key={f.full}
                    placeholder={`Enter ${f.key}`}
                    onChange={(e) =>
                      handleVariableChange(f.full, e.target.value)
                    }
                  />
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}


      {/* ---------------- PREVIEW CARD ---------------- */}
      <Card>
        <CardHeader className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              openInModel(
                prompt.model,
                String(filledContent || prompt.content)
              )
            }
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in {prompt.model}
          </Button>

          <div className="flex gap-2">
            {isOwner && (
              <UpdatePromptDialog prompt={prompt} />
            )}

            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <CopyPromptButton content={String(filledContent)} />
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
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
