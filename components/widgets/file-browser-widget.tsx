"use client";

import { useEffect, useState } from "react";
import FileBrowser from "@/components/file-browser";
import { useAuth } from "@/app/context/AuthContext";
import { filesApi } from "@/lib/api/files";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FileBrowserWidget() {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch only latest 6 files for widget preview
  useEffect(() => {
    if (!user) return;

    async function fetchFiles() {
      try {
        const data = await filesApi.list();
        setFiles((data.files || []).slice(0, 6)); // LIMIT 6 FILES
      } catch (err) {
        console.error("Failed to fetch widget files:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, [user]);

  return (
    <div className="border rounded-lg bg-card p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg">Recent Files</h2>
        <Link
          href="/dashboard/files"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Open Drive <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Body */}
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading files…</p>
      ) : files.length === 0 ? (
        <p className="text-xs text-muted-foreground">No files uploaded yet.</p>
      ) : (
        <FileBrowser files={files} onDelete={() => { }} widgetMode />
      )}
    </div>
  );
}

