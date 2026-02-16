"use client";

import { DownloadCloud, MoreVertical, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import FileTypeBadge from "./file-type-badge";
import { AppFile } from "@/lib/types";

export default function FileList({
  files,
  sortField,
  sortOrder,
  onSortChange,
  onDelete,
  onQuickLook,
}: {
  files: AppFile[];
  sortField: string;
  sortOrder: "asc" | "desc";
  onSortChange: (field: string) => void;
  onDelete: (id: string) => void;
  onQuickLook: (file: AppFile) => void;
}) {
  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  // 🔥 DOWNLOAD HELPER FUNCTION
  const handleDownload = (file: AppFile) => {
    const link = document.createElement("a");
    link.href = file.public_url || `/api/v1/files/${file.id}/download`;
    link.download = file.file_name; // force download filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="border rounded-lg overflow-hidden">

      {/* COLUMN HEADERS */}
      <div className="grid grid-cols-5 bg-muted/30 text-sm px-4 py-2 border-b font-semibold">
        <button
          className="flex items-center gap-1 text-left"
          onClick={() => onSortChange("file_name")}
        >
          Name <SortIcon field="file_name" />
        </button>

        <button
          className="flex items-center gap-1 text-left"
          onClick={() => onSortChange("mime_type")}
        >
          Type <SortIcon field="mime_type" />
        </button>

        <button
          className="flex items-center gap-1 text-left"
          onClick={() => onSortChange("size")}
        >
          Size <SortIcon field="size" />
        </button>

        <button
          className="flex items-center gap-1 text-left"
          onClick={() => onSortChange("created_at")}
        >
          Created <SortIcon field="created_at" />
        </button>

        <span className="text-right">Options</span>
      </div>

      {/* FILE ROWS */}
      {files.map((file: any) => (
        <div
          key={file.id}
          className="grid grid-cols-5 px-4 py-3 border-b text-sm hover:bg-accent/20 cursor-pointer"
          onClick={() => onQuickLook(file)}
        >
          {/* NAME */}
          <div className="truncate">{file.file_name}</div>

          {/* MIME TYPE BADGE */}
          <div className="flex items-center">
            <FileTypeBadge mime={file.mime_type} />
          </div>

          {/* SIZE */}
          <div>{(file.size / 1024 / 1024).toFixed(2)} MB</div>

          {/* CREATED DATE */}
          <div>{new Date(file.created_at).toLocaleDateString()}</div>

          {/* MENU */}
          <div className="flex justify-end items-center gap-4">

            {/* 🔥 DOWNLOAD BUTTON */}
            <DownloadCloud
              className="w-4 h-4 opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation(); // don’t open QuickLook
                handleDownload(file);
              }}
            />

            {/* DELETE BUTTON */}
            <Trash2
              className="w-4 h-4 opacity-60 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation(); // prevent QuickLook
                onDelete(file.id);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
