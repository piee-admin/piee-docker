"use client";
import React from "react";
import { AppFile } from "@/lib/types";
import { AuthenticatedImage } from "@/components/ui/authenticated-image";
import { getFileMimeHelpers } from "@/lib/file-icons";

export default function QuickLookPanel({ file, onClose }: { file: AppFile | null; onClose: () => void }) {
  if (!file) return null;

  const { isImage, isPDF } = getFileMimeHelpers(file.mime_type);

  return (
    <div className="fixed right-0 top-0 h-full w-[350px] bg-background border-l shadow-xl p-4 animate-in slide-in-from-right z-50">
      <button onClick={onClose} className="absolute right-3 top-3 text-sm">
        ✕
      </button>

      <h2 className="font-semibold mb-2">{file.file_name}</h2>

      <div className="border rounded-lg p-2 h-[300px] flex items-center justify-center bg-muted/20 overflow-hidden">
        {isImage && <AuthenticatedImage src={file.public_url} className="object-contain max-h-full w-full h-full" />}
        {isPDF && (
          <iframe src={file.public_url} className="w-full h-full rounded"></iframe>
        )}
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <p><b>Size:</b> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        <p><b>Type:</b> {file.mime_type}</p>
        <p><b>Created:</b> {new Date(file.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
}
