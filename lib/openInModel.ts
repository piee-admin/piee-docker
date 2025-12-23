import { OPEN_MODEL_PRESETS } from "@/config/openModelPresets";

export function openInModel(model: string, prompt: string) {
  const preset = OPEN_MODEL_PRESETS[model];

  if (!preset) {
    console.warn(`No open preset found for model: ${model}`);
    return;
  }

  const url = preset.buildUrl(prompt);

  window.open(url, "_blank", "noopener,noreferrer");

  if (!preset.supportsAutoPaste) {
    navigator.clipboard.writeText(prompt);
  }
}
