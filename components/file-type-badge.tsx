export default function FileTypeBadge({ mime }: { mime: string }) {
  const type = mime.split("/")[1]?.toUpperCase() || "FILE";

  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-foreground/80">
      {type}
    </span>
  );
}
