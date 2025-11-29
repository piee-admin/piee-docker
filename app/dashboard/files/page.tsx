"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import FileUpload from "@/components/file-upload";
import FileBrowser from "@/components/file-browser";
import { deleteFileFromFastAPI } from "@/lib/delete";
import { toast } from "sonner";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export default function FilesPage() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsed, setTotalUsed] = useState<number>(0); // NEW

  // 1. Get token
  useEffect(() => {
    async function fetchToken() {
      if (!user) return;
      const t = await user.getIdToken();
      setToken(t);
    }
    fetchToken();
  }, [user]);

  // 2. Fetch user's files
  useEffect(() => {
    async function fetchFiles() {
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/upload/files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error("Failed to fetch files:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, [token]);

  // ⭐ 3. Fetch user's total storage usage
  useEffect(() => {
    if (!token) return;

    async function fetchStats() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/upload/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setTotalUsed(data.total_storage_used || 0);
      } catch (err) {
        console.error("Failed to fetch storage stats:", err);
      }
    }

    fetchStats();
  }, [token]);

  // 4. Add newly uploaded file live
  // 4. Add newly uploaded file live by fetching real backend data
  const handleUploaded = async () => {
    if (!token) return;

    try {
      // Re-fetch files
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/upload/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setFiles(data.files || []);

      // Re-fetch storage stats
      const stats = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/upload/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const statsData = await stats.json();
      setTotalUsed(statsData.total_storage_used || 0);

      toast.success("File uploaded successfully!");
    } catch (err) {
      console.error("Failed to refresh after upload:", err);
      toast.error("Upload finished, but failed to refresh data.");
    }
  };


  async function handleDelete(fileId: string) {
    try {
      const fileToDelete = files.find((f) => f.id === fileId);

      await deleteFileFromFastAPI(fileId, token!);

      // Remove from UI
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      setTotalUsed((prev) => prev - (fileToDelete?.size || 0)); // update used storage

      toast.success("File deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete file. Please try again.");
    }
  }

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-3xl font-bold">My Drive</h1>

      {/* ⭐ Storage Display */}
      <p className="text-sm text-muted-foreground">
        Storage used: <span className="font-medium">{formatBytes(totalUsed)}</span><span className="font-semibold"> / 10 GB</span>
      </p>

      {/* Upload */}
      <FileUpload token={token} onUploaded={handleUploaded} />

      {loading ? (
        <p className="text-sm text-muted-foreground mt-4">Loading files…</p>
      ) : (
        <FileBrowser files={files} onDelete={handleDelete} />
      )}
    </div>
  );
}
