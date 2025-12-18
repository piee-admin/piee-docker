"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNowStrict } from "date-fns";

import { library } from "@/app/library";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  author?: { name?: string } | null;
};

//
// PAGE
//
export default function LibraryPage() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "text" | "image" | "video">("all");

  const { user, signIn } = useAuth();
  const { fetchUserInfo } = useAppStore();
  const router = useRouter();

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
    await signIn();
    await fetchUserInfo();
    router.refresh();
  };

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      const text = `${p.title ?? ""} ${p.content ?? ""}`.toLowerCase();
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
            <Button onClick={handleLogin}>Sign in to create</Button>
          )}
        </div>

        <Input
          placeholder="Search prompts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />

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
      </header>

      {/* GRID (Pinterest-style Masonry) */}
      {loading ? (
        <p className="text-center py-20 text-muted-foreground">Loading…</p>
      ) : (
        <section className="columns-1 sm:columns-2 lg:columns-4 gap-4">
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
  const isMedia = Boolean(prompt.thumbnail_url);
  const title = prompt.title ?? "Untitled Prompt";

  return (
    <Link
      href={`/library/prompt/${prompt.id}`}
      className="group block mb-4 break-inside-avoid"
    >
      <Card
        className="
          overflow-hidden
          border border-border/40
          transition
          hover:shadow-xl
          hover:scale-[1.01]
        "
      >
        {isMedia ? (
          // IMAGE / VIDEO PROMPT
          <Image
            src={prompt.thumbnail_url!}
            alt={title}
            width={500}
            height={500}
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="
              w-full
              h-auto
              object-cover
              transition
              group-hover:brightness-90
            "
          />
        ) : (
          // TEXT PROMPT FALLBACK
          <div
            className="
              aspect-[4/5]
              flex
              items-center
              justify-center
              p-6
              text-center
              bg-gradient-to-br
              from-muted/60
              to-muted
            "
          >
            <h3
              className="
                text-lg
                font-semibold
                leading-snug
                line-clamp-4
              "
            >
              {title}
            </h3>
          </div>
        )}
      </Card>
    </Link>
  );
}
