"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { library } from "@/app/library";

import { formatDistanceToNowStrict } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import Link from "next/link";

export default function PromptPage() {
  const { id } = useParams(); // ✅ NOW WORKS
  const promptId = id as string;

  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch prompt client-side
  useEffect(() => {
    if (!promptId) return;

    async function fetchPrompt() {
      try {
        const data = await library.prompts.get(promptId);
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

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="text-muted-foreground">Loading prompt…</p>
      </div>
    );
  }

  // Not found state
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

  const tags = Array.isArray(prompt.tags)
    ? prompt.tags
    : prompt.tags
      ? [String(prompt.tags)]
      : [];

  return (
    <main className="container mx-auto px-6 py-12 max-w-4xl space-y-10">
      <Button asChild variant="ghost">
        <Link href="/library">← Back to Library</Link>
      </Button>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
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
              <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
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

          {/* TAGS */}
          {tags.map((t: string) => (
            <Badge key={t}>#{t}</Badge>
          ))}
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="prose max-w-none py-6">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-6">
            {prompt.content}
          </pre>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center gap-4">
        <Button onClick={() => navigator.clipboard.writeText(prompt.content || "")}>
          Copy Prompt
        </Button>

        <Button asChild variant="outline">
          <Link href={`/dashboard/ai/prompts/${prompt.id}`}>Use in Playground</Link>
        </Button>
      </div>
    </main>
  );
}
