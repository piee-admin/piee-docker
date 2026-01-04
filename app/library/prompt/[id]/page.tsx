import { buildPromptMetadata, fetchPromptMeta } from "@/lib/seo";
import PromptPageClient from "./PromptPageClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const prompt = id ? await fetchPromptMeta(id) : null;

  return buildPromptMetadata({
    id,
    prompt,
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const prompt = await fetchPromptMeta(id);

  return (
    <PromptPageClient id={id} prompt={prompt} />
  );
}
