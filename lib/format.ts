export function formatSize(bytes: number) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + " KB";
  return (kb / 1024).toFixed(1) + " MB";
}

export function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString();
}
