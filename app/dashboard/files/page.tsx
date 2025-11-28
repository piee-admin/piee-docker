"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import FileUpload from "@/components/file-upload";
import FileGrid from "@/components/file-grid";
import { deleteFileFromFastAPI } from "@/lib/delete";
import { toast } from "sonner";

export default function FilesPage() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 3. Add newly uploaded file live
  const handleUploaded = (file: any) => {
    setFiles((prev) => [file, ...prev]);
  };

  async function handleDelete(fileId: string) {
  try {
    await deleteFileFromFastAPI(fileId, token!);

    // Remove deleted file from UI
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast.success("File deleted successfully!");
  } catch (err) {
    console.error("Delete failed:", err);
    toast.error("Failed to delete file. Please try again.");
  }
}


  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">My Drive</h1>

      {/* Upload */}
      <FileUpload token={token} onUploaded={handleUploaded} />

      {/* Loading */}
      {loading ? (
        <p className="text-sm text-muted-foreground mt-4">Loading files…</p>
      ) : (
        <FileGrid files={files} onDelete={handleDelete} />
      )}
    </div>
  );
}
