"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNowStrict } from "date-fns";

import { library } from "@/app/library";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { CopyPromptButton } from "@/components/copypromptbutton";
import { CreatePromptDialog } from "@/components/createpromptdialog";
import { useAuth } from "@/app/context/AuthContext";
import { useAppStore } from "@/app/store/useAppStore";
import { useRouter } from "next/navigation";

//
// TYPES
//
type PromptItem = {
  id?: string;
  title?: string;
  content?: string;
  type?: "text" | "image" | "video";
  tags?: string[] | null;
  created_at?: string | null;
  thumbnail_url?: string | null;
  author?: { name?: string; avatar_url?: string } | null;
  [key: string]: any;
};

//
// PAGE
//
export default function LibraryPage() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const {user } = useAuth();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "text" | "image" | "video">("all");
  const { logOut, signIn } = useAuth()
  const router = useRouter()
  const { userInfo, fetchUserInfo } = useAppStore()
  
  useEffect(() => {
    async function load() {
      const res = await library.prompts.list({ limit: 30 });
      const list = Array.isArray(res)
        ? res
        : res?.results ?? res?.data ?? [];
      setPrompts(list);
      setLoading(false);
    }
    load();
  }, []);

  const handleLogin = async () => {
    try {
      await signIn()
      await fetchUserInfo()
      router.refresh()
    } catch (error) {
      console.error("❌ Error logging in:", error)
    }
  }

  // SEARCH + FILTER
  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      const text =
        `${p.title ?? ""} ${p.content ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase();

      const matchesQuery = !query || text.includes(query.toLowerCase());
      const matchesType = type === "all" || p.type === type;

      return matchesQuery && matchesType;
    });
  }, [query, type, prompts]);

  return (
    <main className="container mx-auto px-6 py-10">
      {/* HEADER */}
      <header className="mb-8 space-y-4">
        <div className="flex justify-between">
          <h1 className="text-4xl font-bold">Public Prompts</h1>
          {user ? (
            <CreatePromptDialog />
          ) : (
            <Button
              onClick={handleLogin}
              variant="default"
            >
              Sign in to create
            </Button>
          )}
        </div>

        <p className="text-muted-foreground max-w-prose">
          Explore community-created prompts. Copy, remix, or create your own.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {/* SEARCH */}
          <Input
            placeholder="Search prompts, tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />

          {/* TYPE FILTER */}
          <div className="flex gap-2">
            {["all", "text", "image", "video"].map((t) => (
              <Button
                key={t}
                size="sm"
                variant={type === t ? "default" : "outline"}
                onClick={() => setType(t as any)}
              >
                {t}
              </Button>
            ))}
          </div>

          {/* CREATE PROMPT (EXTERNAL COMPONENT) */}

        </div>
      </header>

      {/* GRID */}
      {loading ? (
        <p className="text-muted-foreground text-center py-20">
          Loading prompts…
        </p>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="grid grid-cols-1 gap-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <PromptCard key={p.id ?? i} prompt={p} />
          ))}
        </section>
      )}
    </main>
  );
}

//
// PROMPT CARD
//
function PromptCard({ prompt }: { prompt: PromptItem }) {
  const title =
    prompt.title ??
    (prompt.content ? String(prompt.content).slice(0, 60) : "Untitled");

  const createdAt = prompt.created_at ?? null;
  const author = prompt.author ?? null;

  return (
    <Card className="border border-border/40 hover:shadow-lg transition-shadow">
      {prompt.thumbnail_url && (
        <div className="p-2">
          <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
            <Image
              src={prompt.thumbnail_url}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-1">
          {title}
        </CardTitle>
        <CardDescription className="text-xs">
          {author?.name ?? "Community"}
          {createdAt && (
            <span className="ml-1">
              • {formatDistanceToNowStrict(new Date(createdAt))} ago
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/**{prompt.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prompt.tags.slice(0, 4).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                #{t}
              </Badge>
            ))}
          </div>
        )} */}

        <Separator />

        <div className="flex items-center justify-between">
          <Button size="sm" asChild>
            <Link href={`/library/prompt/${prompt.id}`}>
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
// EMPTY STATE
//
function EmptyState() {
  return (
    <div className="col-span-full border border-dashed rounded-xl p-10 text-center">
      <h3 className="text-xl font-semibold">No prompts found</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Try adjusting your search or create a new prompt.
      </p>
    </div>
  );
}
