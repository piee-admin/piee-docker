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
  prompt?: any;
};


/* =====================================================
   PROMPT PAGE
===================================================== */

export default function PromptPage({ id, prompt: serverPrompt }: PromptPageProps) {
  const router = useRouter();
  const { user } = useAuth();

  const promptId = id;

  const [prompt, setPrompt] = useState<any>(serverPrompt ?? null);
  const [loading, setLoading] = useState(!serverPrompt);

  const [views, setViews] = useState<number | null>(null);

  const [variables, setVariables] = useState<VariableGroup>({});
  const [filledContent, setFilledContent] = useState("");

  // ⭐ stores values for ALL variables
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const viewFiredRef = useRef(false);


  /* ---------------------------------------------------
     Fetch prompt (fallback)
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
     Extract variables + initialize state
  --------------------------------------------------- */
  useEffect(() => {
    if (!prompt?.content) return;

    const grouped = extractVariables(prompt.content);
    setVariables(grouped);

    // initialize filled with raw prompt
    setFilledContent(prompt.content);

    // initialize blank values for all variables
    const initial: Record<string, string> = {};

    Object.values(grouped).forEach(group =>
      group.forEach(v => (initial[v.full] = ""))
    );

    setVariableValues(initial);

  }, [prompt]);


  /* ---------------------------------------------------
     ⭐ Correct multi-variable replacement
  --------------------------------------------------- */
  function handleVariableChange(fullKey: string, value: string) {
    if (!prompt?.content) return;

    const updated = {
      ...variableValues,
      [fullKey]: value,
    };

    setVariableValues(updated);

    let output = prompt.content;

    // apply ONLY variables that currently have values
    for (const key in updated) {
      const val = updated[key];
      if (!val) continue;

      // escape regex chars in key (important for car.color, a.b.c, etc.)
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(`\\$\\{${escapedKey}\\}`, "g");

      output = output.replace(regex, val);
    }

    setFilledContent(output);
  }



  /* ---------------------------------------------------
     View tracking once
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
    }).catch(() => { });

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
     PAGE LAYOUT (3-column)
  ==================================================== */
  return (
    <motion.main
      className="
        container mx-auto px-6 py-12
        max-w-7xl
        grid gap-8
        grid-cols-1
        md:grid-cols-3
        items-start
      "
    >

      {/* ===== LEFT — CARD ===== */}
      <div className="space-y-8 md:sticky md:top-10 h-fit md:pr-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-4">

            {isMedia ? (
              <div className="overflow-hidden rounded-lg">
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
              <div className="aspect-[4/5] flex items-center justify-center p-10 text-center rounded-md bg-zinc-800">
                <h2 className="text-2xl font-semibold">{title}</h2>
              </div>
            )}

            <CardTitle className="text-2xl font-semibold">
              {title}
            </CardTitle>

            <div className="flex flex-wrap gap-2">
              {prompt.model && <Badge variant="secondary">{prompt.model}</Badge>}
              {prompt.type && <Badge variant="outline">{prompt.type}</Badge>}
              {prompt.category && <Badge variant="outline">{prompt.category}</Badge>}
              <LikeButton resourceId={promptId!} />
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
                  Created {formatDistanceToNowStrict(new Date(createdAt))} ago
                </p>
              )}
            </div>

          </CardHeader>
        </Card>
      </div>


      {/* ===== MIDDLE — VARIABLES ===== */}
      <div className="space-y-8 md:px-2">
        {Object.keys(variables).length > 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Variables</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {Object.entries(variables).map(([group, fields]) => (
                <div key={group} className="grid gap-4">
                  {fields.map((f) => (
                    <Input
                      key={f.full}
                      className="bg-zinc-800 border-zinc-700"
                      placeholder={`Enter ${f.key}`}
                      value={variableValues[f.full] ?? ""}
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
      </div>


      {/* ===== RIGHT — PREVIEW ===== */}
      <div className="space-y-8 md:pl-2">

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-wrap justify-between items-center gap-2 min-w-0">

            <Button
              variant="outline"
              size="sm"
              className="bg-zinc-800 border-zinc-700 shrink-0"
              onClick={() =>
                openInModel(prompt.model, String(filledContent || prompt.content))
              }
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              {prompt.model}
            </Button>

            <div className="flex gap-2 shrink-0">
              {isOwner && <UpdatePromptDialog prompt={prompt} />}

              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-zinc-800 border-zinc-700"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <CopyPromptButton content={String(filledContent)} />
            </div>

          </CardHeader>

          <CardContent className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-6">
              {filledContent}
            </pre>
          </CardContent>
        </Card>
      </div>

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
        disabled={isDeleting}
        onClick={deletePrompt}
      >
        {isDeleting ? "Deleting…" : "Delete"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </motion.main>
  );
}
