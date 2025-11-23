"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";

export default function FilePreview({ file, open, onClose }: any) {
    const [textContent, setTextContent] = useState("");

    const mime = file?.mime_type || "";
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");
    const isAudio = mime.startsWith("audio/");
    const isPDF = mime === "application/pdf";
    const isText =
        mime.startsWith("text/") ||
        mime.includes("json") ||
        mime.includes("xml") ||
        mime.includes("csv");

    // Load text preview safely
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

    // ⭐ FIX: Mobile-safe forced download logic
    const handleDownload = () => {
        // Open in a new tab (mobile-safe)  
        window.open(file.public_url, "_blank");
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-auto p-0">

                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
                    <h2 className="font-semibold truncate">{file?.file_name || "File preview"}</h2>
                    {file?.public_url && (
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                        </Button>
                    )}

                </div>

                {/* BODY */}
                <div className="p-4 flex justify-center">

                    {isImage && (
                        <img
                            src={file.public_url}
                            alt={file.file_name}
                            className="max-h-[75vh] w-auto rounded-lg"
                        />
                    )}

                    {isVideo && (
                        <video
                            src={file.public_url}
                            controls
                            playsInline
                            className="w-full max-h-[75vh] rounded-lg"
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
                            className="w-full h-[75vh] rounded-lg"
                        />
                    )}

                    {isText && (
                        <pre className="w-full max-h-[75vh] overflow-auto bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                            {textContent}
                        </pre>
                    )}

                    {!isImage && !isVideo && !isAudio && !isPDF && !isText && (
                        <div className="text-center text-muted-foreground">
                            <FileText className="w-10 h-10 mx-auto mb-3 opacity-70" />
                            <p>No preview available.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
