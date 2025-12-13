// app/library/page.tsx
import { formatDistanceToNowStrict } from "date-fns";
import { library } from "@/app/library";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CopyPromptButton } from "@/components/copypromptbutton";

import Link from "next/link";

//
// TYPES
//
type PromptItem = {
  id?: string;
  title?: string;
  content?: string;
  tags?: string[] | null;
  created_at?: string | null;
  author?: { name?: string; avatar_url?: string } | null;
  [key: string]: any;
};

//
// MAIN PAGE
//
export default async function Page() {
  // server-side fetch
  const res = await library.prompts.list({ limit: 30 });

  // normalize unpredictable API response shapes
  const prompts: PromptItem[] = Array.isArray(res)
    ? res
    : res?.results ?? res?.data ?? res?.items ?? res ?? [];

  return (
    <main className="container mx-auto px-6 py-10">
      {/* HEADER */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Public Prompts
            </h1>
            <p className="text-muted-foreground mt-2 max-w-prose">
              Explore community-created prompts. Copy, fork, remix, or get
              inspiration to create your own.
            </p>
          </div>

          <div className="flex w-full md:w-auto items-center gap-3">
            <Input
              aria-label="Search prompts"
              placeholder="Search prompts, tags, authors…"
              className="max-w-sm"
            />
            <Button asChild>
              <Link href="/dashboard/ai/prompts">
                Browse All
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* GRID */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.length === 0 ? (
          <EmptyState />
        ) : (
          prompts.map((p, i) => (
            <PromptCard key={p.id ?? i} prompt={p} />
          ))
        )}
      </section>
    </main>
  );
}

//
// CARD COMPONENT
//
function PromptCard({ prompt }: { prompt: PromptItem }) {
  const title =
    prompt.title ??
    (prompt.content ? String(prompt.content).slice(0, 60) : "Untitled");

  const excerpt = prompt.content
    ? String(prompt.content).slice(0, 180)
    : "No description provided.";

  const tags: string[] = Array.isArray(prompt.tags)
    ? prompt.tags
    : prompt.tags
    ? [String(prompt.tags)]
    : [];

  const createdAt = prompt.created_at ?? prompt.createdAt ?? null;
  const author = prompt.author ?? null;

  return (
    <Card className="hover:shadow-xl transition-shadow border border-border/40 overflow-hidden">
      {/* ---------------- Thumbnail (TOP) ---------------- */}
      {prompt.thumbnail_url && (
        <div className="p-2">
          <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
            <Image
              src={prompt.thumbnail_url}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* ---------------- Header ---------------- */}
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        {/* AUTHOR */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            {author?.avatar_url ? (
              <AvatarImage
                src={author.avatar_url}
                alt={author?.name ?? "User"}
              />
            ) : (
              <AvatarFallback>
                {(author?.name ?? "U").slice(0, 1)}
              </AvatarFallback>
            )}
          </Avatar>

          <div>
            <CardTitle className="text-base font-semibold leading-5 line-clamp-1">
              {title}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {author?.name ?? "Community"}
              {createdAt && (
                <span className="ml-1">
                  • {formatDistanceToNowStrict(new Date(createdAt))} ago
                </span>
              )}
            </CardDescription>
          </div>
        </div>

        {/* ACTION */}
        <Button size="sm" variant="ghost" className="px-2">
          <span className="text-lg">⭐</span>
        </Button>
      </CardHeader>

      {/* ---------------- Content ---------------- */}
      <CardContent className="pt-2 space-y-4">
        {/* EXCERPT */}
        <p className="text-sm text-foreground leading-6 line-clamp-3">
          {excerpt}
        </p>

        {/* TAGS */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                #{t}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between gap-4">
          <Button size="sm" asChild>
            <Link href={`/library/prompt/${prompt.id ?? ""}`}>
              Open
            </Link>
          </Button>
          <CopyPromptButton content={String(prompt.content ?? "")} />
        </div>
      </CardContent>
    </Card>
  );
}

//
// EMPTY STATE COMPONENT
//
function EmptyState() {
  return (
    <div className="col-span-full rounded-xl border border-dashed p-10 text-center bg-muted/20">
      <h3 className="text-xl font-semibold">No prompts yet</h3>
      <p className="text-sm text-muted-foreground mt-2">
        No public prompts were found. Add one to get started!
      </p>

      <div className="mt-4 flex items-center justify-center gap-2">
        <Button asChild>
          <Link href="/dashboard/ai/prompts/new">Create Prompt</Link>
        </Button>

        <Button variant="ghost" asChild>
          <Link href="/dashboard/ai/prompts">Browse All</Link>
        </Button>
      </div>
    </div>
  );
}
