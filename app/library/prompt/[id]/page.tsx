"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { library } from "@/app/library";
import { ExternalLink, GitFork } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { CopyPromptButton } from "@/components/copypromptbutton";
import { SimpleTooltip } from "@/components/themed-tooltip";
import { OpenAPI } from "../../api";
import { LikeButton } from "@/components/likebutton";

export default function PromptPage() {
  const params = useParams();
  const promptId =
    typeof params.id === "string" ? params.id : null;
  const { user } = useAuth();



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


  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="text-muted-foreground">Loading prompt…</p>
      </div>
    );
  }

  if (!prompt?.id) {
    return (
      <div className="container mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-semibold">Prompt not found</h2>
        <p className="text-muted-foreground">
          This prompt may have been removed or is not public.
        </p>
        <Button asChild className="mt-6">
          <Link href="/library">Go Back</Link>
        </Button>
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Failed to delete prompt");
      }

      toast.success("Prompt deleted");

      // Redirect to library
      window.location.href = "/library";
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }


  return (
    <main className="container mx-auto px-6 py-12 max-w-4xl space-y-10">
      {/* ===================== PromptCard ===================== */}
      <Card>
        <CardHeader className="space-y-4">
          {/* Media (optional) */}
          {isMedia ? (
            <div className="overflow-hidden rounded-md">
              {prompt.type === "image" && (
                <Image
                  src={prompt.media_url ?? prompt.thumbnail_url}
                  alt={title}
                  width={1200}
                  height={675}
                  sizes="(max-width: 1024px) 100vw, 768px"
                  className="w-full h-auto object-cover"
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
            // TEXT PROMPT FALLBACK (same as card)
            <div
              className="
      aspect-[4/5]
      flex
      items-center
      justify-center
      p-10
      text-center
      rounded-md
      bg-gradient-to-br
      from-muted/60
      to-muted
    "
            >
              <h2 className="text-2xl font-semibold leading-snug">
                {title}
              </h2>
            </div>
          )}


          {/* Title */}
          <CardTitle className="text-2xl font-semibold">
            {title}
          </CardTitle>

          {/* ToolTip */}
          <div className="flex flex-wrap gap-2">
            {prompt.model && (
              <SimpleTooltip label="Which AI model this prompt is optimized for">
                <Badge variant="secondary">{prompt.model}</Badge>
              </SimpleTooltip>
            )}

            {prompt.type && (
              <SimpleTooltip label="Type of output this prompt generates">
                <Badge variant="outline" className="capitalize">
                  {prompt.type}
                </Badge>
              </SimpleTooltip>
            )}

            {prompt.category && (
              <SimpleTooltip label="What this prompt is best used for">
                <Badge variant="outline" className="capitalize">
                  {prompt.category}
                </Badge>
              </SimpleTooltip>
            )}
            <SimpleTooltip label="Like">
              {promptId && <LikeButton resourceId={promptId} />}
            </SimpleTooltip>
          </div>



          {Array.isArray(prompt.tags) && prompt.tags.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>

            </>
          )}


          {/* ===================== PromptMeta ===================== */}
          <div className="flex items-center gap-4">
            {/**<Avatar className="h-10 w-10 border">
              {author?.avatar_url ? (
                <AvatarImage src={author.avatar_url} />
              ) : (
                <AvatarFallback>
                  {(author?.name ?? "U")[0]}
                </AvatarFallback>
              )}
            </Avatar> */}

            <div className="text-sm">
              {/**<p className="font-medium">
                {author?.name ?? "Community"}
              </p> */}
              {createdAt && (
                <p className="text-muted-foreground">
                  Created {" "}
                  {formatDistanceToNowStrict(new Date(createdAt))} ago
                </p>
              )}

              {prompt.forked_from && (
                <Link
                  href={`/library/${prompt.forked_from}`}
                  className="text-muted-foreground hover:underline"
                >
                  Forked from another prompt
                </Link>
              )}
            </div>
          </div>

        </CardHeader>
      </Card>

      <Separator />




      {/* ===================== PromptContent ===================== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">

          <Button asChild variant="outline" size="sm">
            <Link href={chatGptUrl} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in ChatGPT
            </Link>
          </Button>
          <div>

            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />

              </Button>
            )}

            <CopyPromptButton content={String(prompt.content ?? "")} />
          </div>
        </CardHeader>

        <CardContent className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-6">
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
            This action cannot be undone. The prompt will be permanently removed.
          </p>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
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

    </main>
  );
}
