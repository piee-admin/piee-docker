import { buildPromptMetadata } from "@/lib/seo";
import PromptPageClient from "./PromptPageClient";

type Props = {
  params: Promise<{ id?: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  return buildPromptMetadata(params?.id);
}

export default function Page() {
  return <PromptPageClient />;
}
