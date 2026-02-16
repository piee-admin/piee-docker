"use client";
import React, { useEffect, useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { getFileMimeHelpers } from "@/lib/file-icons";
import { AppFile } from "@/lib/types";
import { AuthenticatedImage } from "@/components/ui/authenticated-image";

export default function FilePreview({ file, open, onClose }: { file: AppFile | null, open: boolean, onClose: () => void }) {
  const [textContent, setTextContent] = useState("");

  const { isImage, isVideo, isAudio, isPDF, isText } = getFileMimeHelpers(file?.mime_type);

  useEffect(() => {
    if (!file || !isText) {
      setTextContent("");
      return;
    }
    fetch(file.public_url)
      .then((res) => res.text())
      .then(setTextContent)
      .catch(() => setTextContent("Unable to load preview."));
  }, [file, isText]);

  if (!file) return null;

  const handleDownload = () => {
    window.open(file.public_url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          !w-[80vw]
          !h-[80vh]
          !max-w-screen 
          !max-h-screen 
          p-0 
          overflow-hidden 
          rounded-none 
          border-none
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
          <h2 className="font-semibold truncate">
            {file?.file_name || "File preview"}
          </h2>

          {file?.public_url && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          )}
        </div>

        {/* BODY */}
        <div
          className="
            flex 
            justify-center 
            items-start 
            p-6 
            overflow-auto 
            h-[calc(80vh-64px)]
          "
        >
          {isImage && (
            <AuthenticatedImage
              src={file.public_url}
              alt={file.file_name}
              className="max-h-full w-auto rounded-lg shadow-lg"
            />
          )}

          {isVideo && (
            <video
              src={file.public_url}
              controls
              playsInline
              className="max-h-full max-w-full rounded-lg shadow-lg"
            />
          )}

          {isAudio && (
            <audio controls className="w-full">
              <source src={file.public_url} />
            </audio>
          )}

          {isPDF && (
            <iframe
              src={file.public_url}
              className="w-full h-full rounded-lg shadow-lg"
            />
          )}

          {isText && (
            <pre className="w-full h-full overflow-auto bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap shadow-lg">
              {textContent}
            </pre>
          )}

          {!isImage && !isVideo && !isAudio && !isPDF && !isText && (
            <div className="text-center text-muted-foreground mt-20">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-70" />
              <p>No preview available.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
