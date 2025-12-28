import { buildMetadataForRoute } from "@/lib/seo";
import LibraryPageClient from "./LibraryPageClient";

export async function generateMetadata() {
  return buildMetadataForRoute("/library/prompt");
}

export default function Page() {
  return <LibraryPageClient />;
}
