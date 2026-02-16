"use client";

import { useState } from "react";
import { uploadFileToFastAPI } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FileUpload({ onUploaded }: any) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const res = await uploadFileToFastAPI(file);
      onUploaded(res);
      // toast.success handled by parent
    } catch (e) {
      console.error(e);
      alert("Upload failed. Check console.");
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition
         ${dragging ? "border-primary bg-muted/20" : "border-muted"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length > 0) {
          handleUpload(e.dataTransfer.files[0]);
        }
      }}
    >
      <p className="text-sm mb-3">
        Drag & drop to upload OR choose a file
      </p>



      <input
        id="fileInput"
        type="file"
        className="hidden"
        onChange={(e) => {
          if (!e.target.files?.[0]) return;
          handleUpload(e.target.files[0]);
        }}
      />

      <Button
        disabled={uploading}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        {uploading ? "Uploading..." : "Choose File"}
      </Button>
    </div>
  );
}
