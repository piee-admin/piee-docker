"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import FileUpload from "@/components/file-upload";
import FileBrowser from "@/components/file-browser";
import { filesApi } from "@/lib/api/files";
import { toast } from "sonner";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export default function FilesPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsed, setTotalUsed] = useState<number>(0);

  const fetchFilesAndStats = async () => {
    try {
      const [filesData, statsData] = await Promise.all([
        filesApi.list(),
        filesApi.getStats()
      ]);
      setFiles(filesData.files || []);
      setTotalUsed(statsData.total_storage_used || 0);
    } catch (err) {
      console.error("Failed to fetch files or stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFilesAndStats();
    }
  }, [user]);

  const handleUploaded = () => {
    fetchFilesAndStats();
    toast.success("File uploaded successfully!");
  };

  async function handleDelete(fileId: string) {
    try {
      await filesApi.delete(fileId);
      // Refresh after delete
      fetchFilesAndStats();
      toast.success("File deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete file. Please try again.");
    }
  }

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-3xl font-bold">My Drive</h1>

      <p className="text-sm text-muted-foreground">
        Storage used: <span className="font-medium">{formatBytes(totalUsed)}</span><span className="font-semibold"> / 10 GB</span>
      </p>

      <FileUpload onUploaded={handleUploaded} />

      {loading ? (
        <p className="text-sm text-muted-foreground mt-4">Loading files…</p>
      ) : (
        <FileBrowser files={files} onDelete={handleDelete} />
      )}
    </div>
  );
}

