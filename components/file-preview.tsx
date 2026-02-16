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
            flex-col
            md:flex-row
            h-[calc(80vh-64px)]
            overflow-hidden
          "
        >
          {/* MEDIA PREVIEW AREA */}
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-black/5">
            {isImage && (
              <AuthenticatedImage
                src={file.public_url}
                alt={file.file_name}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
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
              <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-sm border text-center">
                <h3 className="font-semibold mb-4">{file.file_name}</h3>
                <audio controls className="w-full">
                  <source src={file.public_url} />
                </audio>
              </div>
            )}

            {isPDF && (
              <iframe
                src={file.public_url}
                className="w-full h-full rounded-lg shadow-lg bg-white"
              />
            )}

            {isText && (
              <pre className="w-full h-full overflow-auto bg-white p-4 rounded-lg text-sm whitespace-pre-wrap shadow-sm border font-mono">
                {textContent}
              </pre>
            )}

            {!isImage && !isVideo && !isAudio && !isPDF && !isText && (
              <div className="text-center text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No preview available for this file type.</p>
                <div className="mt-4">
                  <Button variant="outline" onClick={handleDownload}>
                    Download File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* METADATA SIDEBAR */}
          <div className="w-full md:w-80 border-l bg-muted/10 p-4 overflow-auto">
            <h3 className="font-semibold text-sm mb-4 uppercase text-muted-foreground tracking-wider">File Details</h3>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Filename</p>
                <p className="font-medium break-all">{file.file_name}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Type</p>
                <p className="font-medium">{file.mime_type}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Size</p>
                <p className="font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Uploaded</p>
                <p className="font-medium">{new Date(file.created_at).toLocaleString()}</p>
              </div>

              {/* Extracted Metadata */}
              {file.meta_data && (() => {
                try {
                  const meta = JSON.parse(file.meta_data);
                  return (
                    <div className="pt-4 mt-4 border-t">
                      <h4 className="font-semibold text-sm mb-3 uppercase text-muted-foreground tracking-wider">Metadata</h4>
                      <div className="space-y-3">
                        {Object.entries(meta).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-muted-foreground text-xs capitalize">{key.replace(/_/g, ' ')}</p>
                            <p className="font-medium">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } catch (e) {
                  return null;
                }
              })()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
