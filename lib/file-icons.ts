import {
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileArchive,
  FileCode,
  FileText,
  FileType,
  FileJson,
  FileAudio,
  FileUp,
  FileSpreadsheet,
  FilePieChart,
  FileChartColumn,
  FileVolume2,
  FileArchiveIcon,
  FileImage,
  FileVideo,
  FilePlus,
  FileStack,
  FileInput,
  FileOutput,
  FileBadge,
  FileCog,
  FileScan,
  FileSearch,
  FileSignature,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileX,
  ChartBar,
  FileChartLine,
  FileChartPie
} from "lucide-react";

export function getFileIconComponent(mime: string | undefined) {
  if (!mime) return File;

  if (mime.startsWith("image/")) return ImageIcon;
  if (mime.startsWith("video/")) return Video;
  if (mime.startsWith("audio/")) return Music;
  if (mime === "application/pdf") return FileTextIcon;
  if (mime.includes("zip") || mime.includes("rar")) return FileArchive;
  if (
    mime.includes("json") ||
    mime.includes("javascript") ||
    mime.includes("python") ||
    mime.includes("text/x") ||
    mime.includes("html")
  )
    return FileCode;

  if (mime.startsWith("text/")) return FileText;

  return File; // fallback generic icon
}
