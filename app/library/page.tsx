// app/library/page.tsx
import { library } from "@/app/library";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

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
  thumbnail?: string | null;
  cover_url?: string | null;
  created_at?: string;
  [key: string]: any;
};

export default async function LibraryPage() {
  // Fetch all library categories
  const promptsRaw = await library.prompts.list({ limit: 20 });
  const modelsRaw = await library.models.list({ limit: 20 });
  const imagesRaw = await library.images.list({ limit: 20 });
  const videosRaw = await library.videos.list({ limit: 20 });

  // Normalized arrays
  const prompts: Item[] = normalize(promptsRaw);
  const models: Item[] = normalize(modelsRaw);
  const images: Item[] = normalize(imagesRaw);
  const videos: Item[] = normalize(videosRaw);

  return (
    <main className="container mx-auto px-6 py-10 space-y-16">
      {/* PAGE TITLE */}
      <section>
        <h1 className="text-4xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Explore prompts, models, images & videos created by the PIEE community.
        </p>
      </section>

      <Separator />

      {/* PROMPTS */}
      <LibrarySection
        title="Prompts"
        subtitle="Community-created prompts to speed up your workflows."
        items={prompts}
        type="prompt"
        link="/library/prompt"
      />

      {/* MODELS */}
      <LibrarySection
        title="Models"
        subtitle="Custom-trained models for text, image, and video workflows."
        items={models}
        type="model"
        link="/library/models"
      />

      {/* IMAGES */}
      <LibrarySection
        title="Images"
        subtitle="Generated images shared by the community."
        items={images}
        type="image"
        link="/library/images"
      />

      {/* VIDEOS */}
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

//
// COMPONENTS
//

/** Normalize API responses into a standard array */
function normalize(input: any): Item[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return input.results || input.data || input.items || [];
}

export function LibrarySection({
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
      <div className="flex items-center justify-between">
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

      {/* Grid */}
      {items.length === 0 ? (
        <EmptyState title={title} />
      ) : (
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {items.map((item, i) => (
              <div key={item.id ?? i} className="min-w-[280px] max-w-[280px]">
                <LibraryCard item={item} type={type} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function LibraryCard({ item, type }: { item: Item; type: string }) {
  const title = item.title || item.name || "Untitled";
  const excerpt =
    item.description || item.content?.slice(0, 120) || "No description";

  const tags =
    Array.isArray(item.tags) ? item.tags : item.tags ? [String(item.tags)] : [];

  return (
    <Card className="hover:shadow-medium transition-shadow duration-200 overflow-hidden">
      {/* ---------------- Thumbnail (TOP) ---------------- */}
      {(item.thumbnail_url || item.cover_url) && (
        <div className="p-2">
          <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
            <Image
              src={item.thumbnail_url || item.cover_url || "/placeholder.png"}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* ---------------- Content ---------------- */}
      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-1">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {excerpt}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                #{t}
              </Badge>
            ))}
          </div>
        )}

        {/* Action */}
        <Link
          href={`/library/${type}/${item.id ?? ""}`}
          className="inline-block text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Open →
        </Link>
      </CardContent>
    </Card>
  );
}


function EmptyState({ title }: { title: string }) {
  return (
    <div className="p-8 text-center border rounded-lg bg-muted/30">
      <h3 className="font-semibold text-lg">No {title.toLowerCase()} found</h3>
      <p>
        Try exploring other categories or refresh later.
      </p>
    </div>
  );
}
