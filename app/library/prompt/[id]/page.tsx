"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { library } from "@/app/library";
import { ExternalLink, Eye, GitFork, Trash2 } from "lucide-react";
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

export default function PromptPage() {
  const viewFiredRef = useRef(false);

  const params = useParams();
  const promptId =
    typeof params.id === "string" ? params.id : null;
  const { user } = useAuth();

  const [views, setViews] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  /* ===================== Skeleton ===================== */
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

  if (!prompt?.id) {
    const router = useRouter();

    return (
      <div className="container mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-semibold">Prompt not found</h2>

        <p className="text-muted-foreground">
          The prompt exists but failed to load. Try reloading.
        </p>

        <div className="flex justify-center gap-3 pt-4">
          {/* Reload */}
          <Button
            variant="default"
            onClick={() => router.refresh()}
          >
            Reload
          </Button>

          {/* Go back */}
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

  const chatGptUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(
    String(prompt.content ?? "")
  )}`;

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

  /* ===================== Page ===================== */
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="container mx-auto px-6 py-12 max-w-4xl space-y-10"
    >
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
              <Badge variant="outline">{prompt.type}</Badge>
            )}
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
                Created{" "}
                {formatDistanceToNowStrict(new Date(createdAt))} ago
              </p>
            )}
          </div>
        </CardHeader>
      </Card>

      <Separator />

      <Card>
        <CardHeader className="flex flex-row justify-between">
          <SimpleTooltip label="If not auto-pasted, the prompt is copied—just paste it.">
            <Button onClick={() => openInModel(prompt.model, String(prompt.content))} variant="outline" size="sm">

              <ExternalLink className="mr-2 h-4 w-4" />
              Open in {prompt.model}

            </Button>
          </SimpleTooltip>


          <div className="flex gap-2">
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <CopyPromptButton content={String(prompt.content ?? "")} />
          </div>
        </CardHeader>

        <CardContent className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {prompt.content}
          </pre>
        </CardContent>
      </Card>

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
