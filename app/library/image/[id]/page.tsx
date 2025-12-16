"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { library } from "@/app/library";
import { ExternalLink } from "lucide-react";


import { formatDistanceToNowStrict } from "date-fns";
import Image from "next/image";
import Link from "next/link";

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

import { CopyPromptButton } from "@/components/copypromptbutton";

export default function PromptPage() {
  const { id } = useParams();
  const promptId = id as string;


  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch prompt client-side
  useEffect(() => {
    if (!promptId) return;

    async function fetchPrompt() {
      try {
        const data = await library.images.get(promptId);
        setPrompt(data);
      } catch (error) {
        console.error("Failed to load prompt:", error);
        setPrompt(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPrompt();
  }, [promptId]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="text-muted-foreground">Loading prompt…</p>
      </div>
    );
  }

  // Not found
  if (!prompt || !prompt.id) {
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
    (prompt.content ? String(prompt.content).slice(0, 60) : "Untitled Prompt");

  const createdAt = prompt.created_at;
  const author = prompt.author ?? null;
  const chatGptUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(
    String(prompt.content ?? "")
  )}`;

  const tags = Array.isArray(prompt.tags)
    ? prompt.tags
    : prompt.tags
      ? [String(prompt.tags)]
      : [];

  return (
    <main className="container mx-auto px-6 py-12 max-w-4xl space-y-10">
      {/* Back */}
      <Button asChild variant="ghost">
        <Link href="/library">← Back to Library</Link>
      </Button>

      {/* Prompt Header */}
      <Card>
        <CardHeader className="space-y-4">
          {/* Optional Thumbnail / Reference Media */}
          {prompt.media_url && (
            <div className="p-2">
              <div className="w-full rounded-md overflow-hidden bg-muted">
                {/* IMAGE */}
                {prompt.type === "image" && (
                  <div className="relative w-full aspect-video">
                    <Image
                      src={prompt.media_url}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* VIDEO */}
                {prompt.type === "video" && (
                  <video
                    src={prompt.media_url}
                    poster={prompt.thumbnail_url}
                    controls
                    className="w-full rounded-md"
                  />
                )}

                {/* AUDIO */}
                {prompt.type === "audio" && (
                  <audio
                    src={prompt.media_url}
                    controls
                    className="w-full"
                  />
                )}
              </div>
            </div>
          )}
          <Badge variant="outline">{prompt.type.toUpperCase()}</Badge>

          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border">
              {author?.avatar_url ? (
                <AvatarImage src={author.avatar_url} />
              ) : (
                <AvatarFallback>
                  {(author?.name ?? "U").slice(0, 1)}
                </AvatarFallback>
              )}
            </Avatar>

            <div>
              <CardTitle className="text-2xl font-semibold">
                {title}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {author?.name ?? "Community"}
                {createdAt && (
                  <>
                    {" "}
                    • {formatDistanceToNowStrict(new Date(createdAt))} ago
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t: string) => (
                <Badge key={t} variant="secondary">
                  #{t}
                </Badge>
              ))}
            </div>
          )}
          {/* Actions */}
          <div className="flex items-center gap-4">
            {/** <CopyPromptButton content={String(prompt.content ?? "")} />

       <Button asChild variant="outline">
          <Link href={`/dashboard/ai/prompts/${prompt.id}`}>
            Use in Playground
          </Link>
        </Button> */}
          </div>
        </CardHeader>
      </Card>
      <Separator />
      {/* Prompt Content */}
      <Card>
        {/* Header with actions */}
        <CardHeader className="flex flex-row items-center justify-between">
          <Button asChild variant="outline" size="sm">
            <Link href={chatGptUrl} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in ChatGPT
            </Link>
          </Button>

          <CopyPromptButton content={String(prompt.content ?? "")} />
        </CardHeader>

        {/* Full-width content */}
        <CardContent className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-6">
            {prompt.content}
          </pre>
        </CardContent>
      </Card>

    </main>
  );
}
