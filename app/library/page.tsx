// app/library/page.tsx
import { library } from "@/app/library";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { buildMetadataForRoute } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Shared item type
type Item = {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  content?: string;
  tags?: string[] | null;
  thumbnail_url?: string | null;
  cover_url?: string | null;
  created_at?: string;
  [key: string]: any;
};

export async function generateMetadata() {
  return buildMetadataForRoute("/library");
}


export default async function LibraryPage() {
  const prompts = normalize(await library.prompts.list({ limit: 10 }));
  const models = normalize(await library.models.list({ limit: 10 }));
  const images = normalize(await library.images.list({ limit: 10 }));
  const videos = normalize(await library.videos.list({ limit: 10 }));

  return (
    <main className="container mx-auto px-6 py-12 space-y-20 overflow-x-hidden">
      {/* PAGE HEADER */}
      <section className="max-w-3xl space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground text-lg">
          Explore prompts, models, images & videos created by the PIEE community.
        </p>
      </section>

      <Separator />

      <LibrarySection
        title="Prompts"
        subtitle="Community-created prompts to speed up workflows."
        items={prompts}
        type="prompt"
        link="/library/prompt"
      />

      <LibrarySection
        title="Models"
        subtitle="Custom-trained AI models."
        items={models}
        type="model"
        link="/library/models"
      />

      <LibrarySection
        title="Images"
        subtitle="Generated images shared by the community."
        items={images}
        type="image"
        link="/library/images"
      />

      <LibrarySection
        title="Videos"
        subtitle="AI-generated videos and animations."
        items={videos}
        type="video"
        link="/library/videos"
      />
    </main>
  );
}

/* -------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------- */

function normalize(input: any): Item[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return input.results || input.data || input.items || [];
}

/* -------------------------------------------------- */
/* Sections */
/* -------------------------------------------------- */

function LibrarySection({
  title,
  subtitle,
  items,
  type,
  link,
}: {
  title: string;
  subtitle: string;
  items: Item[];
  type: "prompt" | "model" | "image" | "video";
  link: string;
}) {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        <Link
          href={link}
          className="text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          View all →
        </Link>
      </div>

      {/* Horizontal scroll */}
      {items.length === 0 ? (
        <EmptyState title={title} />
      ) : (
        <div className="relative -mx-6">
          <div className="flex gap-6 px-6 pb-4 overflow-x-auto scrollbar-hide">
            {items.map((item, i) => (
              <LibraryCard key={item.id ?? i} item={item} type={type} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------- */
/* Card */
/* -------------------------------------------------- */

function LibraryCard({ item, type }: { item: Item; type: string }) {
  const title = item.title || item.name || "Untitled";
  const description =
    item.description ||
    item.content?.slice(0, 120) ||
    "No description available.";

  const tags = Array.isArray(item.tags)
    ? item.tags
    : item.tags
    ? [String(item.tags)]
    : [];

  const image =
    item.thumbnail_url ||
    item.cover_url ||
    "/prompt-placeholder.png";

  return (
    <Card
      className="
        w-[260px]
        flex-shrink-0
        rounded-xl
        overflow-hidden
        border border-border/60
        bg-background
        transition-all
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/5] bg-muted">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <CardHeader className="pb-2">
        <CardTitle className="text-sm line-clamp-1">
          {title}
        </CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px]"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action */}
        <Link
          href={`/library/${type}/${item.id ?? ""}`}
          className="inline-block text-xs font-medium text-primary hover:underline underline-offset-4"
        >
          Open →
        </Link>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------- */
/* Empty */
/* -------------------------------------------------- */

function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center bg-muted/30">
      <h3 className="font-semibold text-lg">
        No {title.toLowerCase()} found
      </h3>
      <p className="text-muted-foreground text-sm mt-1">
        Try exploring other categories or refresh later.
      </p>
    </div>
  );
}
